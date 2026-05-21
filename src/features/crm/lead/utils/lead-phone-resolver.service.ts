import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { normalizePhone } from './normalize-phone';

const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Resolves a business's preferred dial code and applies it to incoming phone
 * strings. Caches the country-code lookup in-memory for 5 minutes per business
 * so we don't add a DB roundtrip to every lead write. The cache is intentionally
 * process-local; multi-instance deployments tolerate up to one TTL of drift,
 * which is fine for a setting that admins rarely change.
 */
@Injectable()
export class LeadPhoneResolverService {
  private readonly cache = new Map<string, { value: string; expiresAt: number }>();

  constructor(private readonly prisma: PrismaService) {}

  async normalize(businessId: string, phone: string | null | undefined): Promise<string | null> {
    if (!phone) return null;
    const cc = await this.countryCodeFor(businessId);
    return normalizePhone(phone, cc);
  }

  /** Synchronous variant for hot paths that already loaded the country code. */
  normalizeWith(cc: string, phone: string | null | undefined): string | null {
    return normalizePhone(phone, cc);
  }

  async countryCodeFor(businessId: string): Promise<string> {
    const cached = this.cache.get(businessId);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    try {
      const settings = await (this.prisma.business_settings as any).findUnique({
        where: { business_id: businessId },
        select: { default_country_code: true },
      });
      const value = (settings?.default_country_code || '91').replace(/\D/g, '') || '91';
      this.cache.set(businessId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
      return value;
    } catch {
      return '91';
    }
  }

  invalidate(businessId: string): void {
    this.cache.delete(businessId);
  }
}
