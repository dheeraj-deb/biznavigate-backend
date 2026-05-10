import { BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';

const ISO_OFFSET_RE = /(?:z|[+-]\d{2}:?\d{2})$/i;
const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export type ResolvedCampaignTime = {
    sendAt: Date;
    timezone: string;
};

export function getDefaultCampaignTimezone(configured?: string | null): string {
    return configured || process.env.CAMPAIGN_DEFAULT_TIMEZONE || DEFAULT_TIMEZONE;
}

export function resolveCampaignSendAt(
    value: string | Date,
    timezone?: string | null,
    defaultTimezone?: string | null,
): ResolvedCampaignTime {
    const resolvedTimezone = validateTimezone(timezone || getDefaultCampaignTimezone(defaultTimezone));

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            throw new BadRequestException('Campaign schedule.sendAt is invalid');
        }

        return { sendAt: value, timezone: resolvedTimezone };
    }

    if (typeof value !== 'string' || !value.trim()) {
        throw new BadRequestException('Campaign schedule.sendAt is required');
    }

    const raw = value.trim();
    const parsed = hasExplicitOffset(raw)
        ? DateTime.fromISO(raw, { setZone: true })
        : parseLocalDateTime(raw, resolvedTimezone);

    if (!parsed.isValid) {
        throw new BadRequestException(`Campaign schedule.sendAt is invalid: ${parsed.invalidExplanation ?? parsed.invalidReason}`);
    }

    return { sendAt: parsed.toUTC().toJSDate(), timezone: resolvedTimezone };
}

export function resolveOptionalCampaignDate(
    value: string | Date | undefined,
    timezone: string,
): Date | undefined {
    if (!value) return undefined;
    return resolveCampaignSendAt(value, timezone).sendAt;
}

function validateTimezone(timezone: string): string {
    const zoneCheck = DateTime.now().setZone(timezone);
    if (!zoneCheck.isValid) {
        throw new BadRequestException(`Invalid campaign timezone "${timezone}"`);
    }

    return timezone;
}

function hasExplicitOffset(value: string): boolean {
    return ISO_OFFSET_RE.test(value);
}

function parseLocalDateTime(value: string, timezone: string): DateTime {
    const normalized = value.replace(' ', 'T');
    const fromIso = DateTime.fromISO(normalized, { zone: timezone });
    if (fromIso.isValid) return fromIso;

    return DateTime.fromSQL(value, { zone: timezone });
}
