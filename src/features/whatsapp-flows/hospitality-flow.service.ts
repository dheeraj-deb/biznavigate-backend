import { Injectable, Logger } from '@nestjs/common';
import * as https from 'node:https';
import * as http from 'node:http';
import * as sharp from 'sharp';
import { PrismaService } from '../../prisma/prisma.service';
import { CatalogService } from '../commerce/catalog/catalog.service';
import { HospitalityBookingCommandService } from '../industries/hospitality/bookings/application/services/hospitality-booking-command.service';

@Injectable()
export class HospitalityFlowService {
  private readonly logger = new Logger(HospitalityFlowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogService: CatalogService,
    private readonly hospitalityBookingCommandService: HospitalityBookingCommandService,
  ) { }

  private successResponse(params: Record<string, any>) {
    return {
      screen: 'SUCCESS',
      data: {
        extension_message_response: {
          params,
        },
      },
    };
  }

  async handleInit(data: any, businessId?: string, flowToken?: string) {
    this.logger.log(`Hospitality INIT for business ${businessId}`);
    businessId = businessId ?? data?.business_id;

    // Agent handoff: dates embedded in flow_token → pre-fill SELECT_DATES
    // (WhatsApp rejects AVAILABILITY_RESULT as an entry screen because it has incoming routes)
    let tokenCtx: any = {};
    if (flowToken) {
      try { tokenCtx = JSON.parse(flowToken); } catch { /* not JSON */ }
    }
    const checkIn = tokenCtx.check_in ?? data?.check_in;
    const checkOut = tokenCtx.check_out ?? data?.check_out;

    return {
      screen: 'SELECT_DATES',
      data: {
        min_date: new Date().toISOString().split('T')[0],
        error_message: '',
        has_error: false,
        ...(checkIn ? { check_in: checkIn } : {}),
        ...(checkOut ? { check_out: checkOut } : {}),
      },
    };
  }

  async handleBack(_screen: string, data: any, businessId?: string) {
    // Hold release not needed — new catalog uses item_availability directly
    void data; void businessId;
    return {
      screen: 'SELECT_DATES',
      data: {
        min_date: new Date().toISOString().split('T')[0],
        error_message: '',
        has_error: false,
      },
    };
  }

  async handleDataExchange(screen: string, data: any, flowToken: string, businessId?: string) {
    if (screen === 'SELECT_DATES') {
      return this.checkAvailability(data, flowToken, businessId);
    }

    if (screen === 'AVAILABILITY_RESULT') {
      return this.getRoomDetail(data, businessId);
    }

    if (screen === 'ROOM_DETAIL') {
      return {
        screen: 'BOOKING_DETAILS',
        data: {
          service_id: data.service_id,
          hold_id: data.hold_id ?? '',
          check_in: data.check_in,
          check_out: data.check_out,
          label_checkin: data.label_checkin,
          label_checkout: data.label_checkout,
          label_nights: data.label_nights,
          label_total: data.label_total,
        },
      };
    }

    if (screen === 'FACILITIES') {
      // Reserve tapped from facilities screen — forward to BOOKING_DETAILS
      return {
        screen: 'BOOKING_DETAILS',
        data: {
          service_id: data.service_id,
          hold_id: data.hold_id ?? '',
          check_in: data.check_in,
          check_out: data.check_out,
          label_checkin: data.label_checkin,
          label_checkout: data.label_checkout,
          label_nights: data.label_nights,
          label_total: data.label_total,
        },
      };
    }

    if (screen === 'BOOKING_DETAILS') {
      return this.createBooking(data, businessId);
    }

    return { data: { error_message: 'Unknown screen' } };
  }

  private async getRoomDetail(data: any, businessId?: string) {
    const { service_id, check_in, check_out, nights } = data;

    const [service, business] = await Promise.all([
      this.prisma.catalog_items.findFirst({
        where: { item_id: service_id, deleted_at: null },
        select: {
          name: true,
          description: true,
          image_urls: true,
          base_price: true,
          attributes: true,
          hospitality_detail: true,
        },
      }),
      businessId
        ? this.prisma.businesses.findUnique({
            where: { business_id: businessId },
            select: { address: true, city: true },
          })
        : null,
    ]);

    const fromStr = new Date(check_in).toISOString().split('T')[0];
    const checkOutStr = new Date(check_out).toISOString().split('T')[0];

    // Get availability from item_availability
    const availRows = await this.catalogService.getAvailability(service_id, businessId ?? '', fromStr, checkOutStr);
    const pricePerNight = availRows.find(r => r.price != null)?.price
      ? Number(availRows.find(r => r.price != null)!.price)
      : Number(service?.base_price ?? 0);
    const minSlots = availRows.length > 0
      ? Math.min(...availRows.map(r => r.available_slots))
      : 0;

    // Holds not supported in new catalog — skip
    const holdId = '';

    const imageUrls = (service?.image_urls as string[] | null) ?? [];
    const images = await Promise.all(
      imageUrls.map(async (url, i) => ({
        src: await this.fetchImageAsBase64(url),
        'alt-text': `${service?.name ?? 'Room'} image ${i + 1}`,
      })),
    );

    const numNights = Number(nights);
    const totalPrice = pricePerNight * numNights;

    // --- stock: minimum available slots across the stay ---
    const stockLabel = minSlots <= 5 && minSlots > 0
      ? `Only ${minSlots} left`
      : minSlots > 5
        ? `${minSlots} available`
        : 'Fully booked';

    // --- facilities from attributes.amenities ---
    const attrs = {
      ...((service?.attributes as Record<string, any> | null) ?? {}),
      ...((service?.hospitality_detail?.metadata as Record<string, any> | null) ?? {}),
      ...(service?.hospitality_detail
        ? {
            amenities: service.hospitality_detail.amenities,
            capacity: service.hospitality_detail.capacity,
            total_units: service.hospitality_detail.total_units,
          }
        : {}),
    };
    const amenities = attrs?.amenities ?? {};
    // amenities can be { "Bathroom": ["Bidet", "Towels"], "Bedroom": ["Wardrobe"] }
    // or a flat string[]
    let facilitiesGroups: Array<{ category: string; items: string[] }> = [];
    if (Array.isArray(amenities)) {
      facilitiesGroups = amenities.length ? [{ category: 'Amenities', items: amenities.map(String) }] : [];
    } else if (typeof amenities === 'object') {
      facilitiesGroups = Object.entries(amenities).map(([cat, items]) => ({
        category: cat,
        items: Array.isArray(items) ? items.map(String) : [String(items)],
      }));
    }
    const facilitiesText = facilitiesGroups
      .map(g => `${g.category}\n${g.items.map(i => `  • ${i}`).join('\n')}`)
      .join('\n\n');
    const facilitiesPreview = facilitiesGroups
      .flatMap(g => g.items)
      .slice(0, 3)
      .map(i => `• ${i}`)
      .join('\n');
    const hasFacilities = facilitiesGroups.length > 0;

    // --- map URL from business address ---
    const locationQuery = [business?.address, business?.city].filter(Boolean).join(', ');
    const mapUrl = locationQuery
      ? `https://maps.google.com/?q=${encodeURIComponent(locationQuery)}`
      : '';

    // booking data passed through to sub-screens
    const bookingPayload = {
      service_id,
      hold_id: holdId,
      check_in: fromStr,
      check_out: checkOutStr,
      nights_count: numNights,
      label_checkin: `Check-in: ${fromStr}`,
      label_checkout: `Check-out: ${checkOutStr}`,
      label_nights: `Nights: ${numNights}`,
      label_total: `Total: \u20B9${totalPrice}`,
    };

    return {
      screen: 'ROOM_DETAIL',
      data: {
        ...bookingPayload,
        name: service?.name ?? '',
        description: service?.description ?? 'No description available.',
        map_url: mapUrl,
        has_map: !!mapUrl,
        images: [...images, ...images, ...images],
        label_price: `\u20B9${pricePerNight} / night`,
        stock_label: stockLabel,
        has_facilities: hasFacilities,
        facilities_preview: facilitiesPreview,
        facilities_text: facilitiesText,
      },
    };
  }

  async checkAvailability(data: any, _flowToken: string, businessId?: string) {
    // DatePickers outside a Form don't resolve ${var} template syntax in payload.
    // Fall back to _flowContext (populated from flow_token) which always has the correct dates.
    const check_in = data._flowContext?.check_in ?? data.check_in;
    const check_out = data._flowContext?.check_out ?? data.check_out;

    if (!check_in || !check_out) {
      return {
        screen: 'SELECT_DATES',
        data: {
          error_message: 'Please select both check-in and check-out dates.',
          has_error: true,
        },
      };
    }

    // DatePicker outside a Form returns epoch ms (number or numeric string); inside Form returns ISO string
    const parseFlowDate = (val: any): Date => {
      const n = Number(val);
      return isNaN(n) ? new Date(val) : new Date(n);
    };
    const checkInDate = parseFlowDate(check_in);
    const checkOutDate = parseFlowDate(check_out);
    const numNights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (numNights <= 0) {
      return {
        screen: 'SELECT_DATES',
        data: {
          error_message: 'Check-out date must be after check-in date.',
          has_error: true,
        },
      };
    }

    const services = businessId
      ? await this.prisma.catalog_items.findMany({
        where: { business_id: businessId, is_active: true, deleted_at: null, item_type: 'accommodation' },
        select: { item_id: true, name: true, base_price: true, description: true, image_urls: true },
      })
      : [];

    const availableServices: Array<{
      id: string;
      'main-content': { title: string; description?: string; metadata?: string };
      start: { image: string; 'alt-text': string };
      'on-click-action': { name: string; payload: Record<string, any> };
    }> = [];

    for (const service of services) {
      const availRows = await this.catalogService.getAvailability(
        service.item_id,
        businessId ?? '',
        checkInDate.toISOString().split('T')[0],
        checkOutDate.toISOString().split('T')[0],
      );

      const minAvailable = availRows.length > 0
        ? Math.min(...availRows.map(r => r.available_slots))
        : 0;
      if (availRows.some(r => r.is_blocked) || minAvailable <= 0) continue;

      const pricePerNight = availRows.find(r => r.price != null)?.price
        ? Number(availRows.find(r => r.price != null)!.price)
        : Number(service.base_price);

      const imageUrls = service.image_urls as string[] | null;
      const image = imageUrls?.[0] ? await this.fetchImageAsBase64(imageUrls[0], 100 * 1024) : '';
      this.logger.debug(`Item ${service.item_id} image_urls=${JSON.stringify(imageUrls)} image_length=${image.length}`);

      availableServices.push({
        id: service.item_id,
        'main-content': {
          title: service.name.length > 30 ? service.name.slice(0, 27) + '...' : service.name,
          metadata: `₹${pricePerNight}/night`,
        },
        start: {
          image,
          'alt-text': service.name,
        },
        'on-click-action': {
          name: 'data_exchange',
          payload: {
            service_id: service.item_id,
            check_in: checkInDate.toISOString().split('T')[0],
            check_out: checkOutDate.toISOString().split('T')[0],
            nights: numNights,
          },
        },
      });
    }

    if (availableServices.length === 0) {
      return {
        screen: 'SELECT_DATES',
        data: {
          error_message: 'No rooms available for the selected dates.',
          has_error: true,
        },
      };
    }

    return {
      screen: 'AVAILABILITY_RESULT',
      data: {
        available: true,
        not_available: false,
        available_services: availableServices,
        check_in,
        check_out,
        nights: numNights,
        error_message: '',
      },
    };
  }

  private async createBooking(data: any, businessId?: string) {
    const response = await this.hospitalityBookingCommandService.createBooking({
      ...data,
      business_id: businessId ?? data?.business_id,
      source: 'whatsapp',
      actor: 'ai',
    });

    this.logger.log(`Order/booking created: ${response.legacy_order_id}`);
    return this.successResponse(response);
  }

  private fetchImageAsBase64(url: string, maxBytes = Infinity): Promise<string> {
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      client.get(url, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', async () => {
          try {
            let buf = Buffer.concat(chunks);
            if (buf.byteLength === 0) { resolve(''); return; }

            if (buf.byteLength > maxBytes) {
              // Resize and re-compress to fit under maxBytes
              let quality = 80;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              let resized: any = buf;
              while (resized.byteLength > maxBytes && quality >= 20) {
                resized = Buffer.from(await sharp(buf)
                  .resize({ width: 800, withoutEnlargement: true })
                  .jpeg({ quality })
                  .toBuffer()) as unknown as Buffer;
                quality -= 20;
              }
              buf = resized.byteLength <= maxBytes ? Buffer.from(resized) : Buffer.alloc(0);
            }

            resolve(buf.byteLength > 0 ? buf.toString('base64') : '');
          } catch {
            resolve('');
          }
        });
        res.on('error', () => resolve(''));
      }).on('error', () => resolve(''));
    });
  }
}
