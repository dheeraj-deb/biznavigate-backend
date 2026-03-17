import { Injectable, Logger } from '@nestjs/common';
import * as https from 'node:https';
import * as http from 'node:http';
import { PrismaService } from '../../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class HospitalityFlowService {
  private readonly logger = new Logger(HospitalityFlowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
  ) { }

  async handleInit(data: any, businessId?: string) {
    this.logger.log(`Hospitality INIT for business ${businessId}`);
    businessId = businessId ?? data?.business_id;

    const today = new Date().toISOString().split('T')[0];

    return {
      screen: 'SELECT_DATES',
      data: {
        min_date: today,
      },
    };
  }

  async handleBack(screen: string, data: any) {
    return {
      screen: 'SELECT_DATES',
      data: {
        service_id: data?.service_id ?? '',
        service_name: data?.service_name ?? '',
      },
    };
  }

  async handleDataExchange(screen: string, data: any, flowToken: string, businessId?: string) {
    if (screen === 'SELECT_DATES') {
      return this.checkAvailability(data, flowToken, businessId);
    }

    if (screen === 'AVAILABILITY_RESULT') {
      return this.getRoomDetail(data);
    }

    if (screen === 'ROOM_DETAIL') {
      return {
        screen: 'BOOKING_DETAILS',
        data: {
          service_id: data.service_id,
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

  private async getRoomDetail(data: any) {
    const { service_id, check_in, check_out, nights } = data;

    const service = await this.prisma.services.findFirst({
      where: { service_id },
      select: { name: true, description: true, image_urls: true, base_price: true },
    });

    const fromStr = new Date(check_in).toISOString().split('T')[0];
    const toStr = new Date(check_out).toISOString().split('T')[0];
    const records = await this.inventoryService.getAvailability(service_id, fromStr, toStr);

    const pricePerNight = records[0]?.effective_price
      ? Number(records[0].effective_price)
      : Number(service?.base_price ?? 0);

    const imageUrls = (service?.image_urls as string[] | null) ?? [];
    const images = await Promise.all(
      imageUrls.map(async (url, i) => ({
        src: await this.fetchImageAsBase64(url),
        'alt-text': `${service?.name ?? 'Room'} image ${i + 1}`,
      })),
    );

    const numNights = Number(nights);
    const totalPrice = pricePerNight * numNights;
    return {
      screen: 'ROOM_DETAIL',
      data: {
        service_id,
        name: service?.name ?? '',
        description: service?.description ?? 'No description available.',
        images: [...images, ...images, ...images],
        label_checkin: `Check-in: ${check_in}`,
        label_checkout: `Check-out: ${check_out}`,
        label_nights: `Nights: ${numNights}`,
        label_price: `\u20B9${pricePerNight} / night`,
        label_total: `Total: \u20B9${totalPrice}`,
      },
    };
  }

  private async checkAvailability(data: any, _flowToken: string, businessId?: string) {
    const { check_in, check_out } = data;

    if (!check_in || !check_out) {
      return {
        screen: 'SELECT_DATES',
        data: { error_message: 'Please fill in all fields.' },
      };
    }

    console.log("bussinessId", businessId);

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const numNights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (numNights <= 0) {
      return {
        screen: 'SELECT_DATES',
        data: { error_message: 'Check-out must be after check-in.' },
      };
    }

    const fromStr = checkInDate.toISOString().split('T')[0];
    const toStr = checkOutDate.toISOString().split('T')[0];

    const services = businessId
      ? await this.prisma.services.findMany({
        where: { business_id: businessId, is_active: true },
        select: { service_id: true, name: true, base_price: true, description: true, image_urls: true },
      })
      : [];

    const availableServices: Array<{ id: string; title: string; description: string; image: string }> = [];

    for (const service of services) {
      const records = await this.inventoryService.getAvailability(
        service.service_id,
        fromStr,
        toStr,
      );

      const hasBlockedOrFull = records.some((r) => r.is_blocked || r.available_slots <= 0);
      if (hasBlockedOrFull) continue;

      const slotsLeft =
        records.length > 0 ? Math.min(...records.map((r) => r.available_slots)) : 0;
      if (slotsLeft <= 0) continue;

      const pricePerNight = records[0]?.effective_price
        ? Number(records[0].effective_price)
        : Number(service.base_price ?? 0);

      const imageUrls = service.image_urls as string[] | null;
      const image = imageUrls?.[0] ? await this.fetchImageAsBase64(imageUrls[0]) : '';
      availableServices.push({
        id: service.service_id,
        title: `${service.name} — ₹${pricePerNight}/night`,
        description: service.description ?? '',
        image,
      });
    }

    console.log("available services", availableServices);

    if (availableServices.length === 0) {
      return {
        screen: 'AVAILABILITY_RESULT',
        data: {
          available: false,
          not_available: true,
          available_services: [],
          check_in,
          check_out,
          nights: numNights,
          error_message: 'No availability for the selected dates.',
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
    const {
      service_id, label_checkin, label_checkout, label_nights, label_total,
      guest_name, phone, num_guests, age, address, pin_code,
    } = data;

    // Parse dates back from labels e.g. "Check-in: 2026-03-17"
    const checkInDate = new Date(label_checkin.replace('Check-in: ', ''));
    const checkOutDate = new Date(label_checkout.replace('Check-out: ', ''));
    const totalPrice = parseFloat(label_total.replace(/[^\d.]/g, ''));

    const service = await this.prisma.services.findFirst({
      where: { service_id },
      select: { business_id: true },
    });

    const booking = await this.prisma.service_bookings.create({
      data: {
        service_id,
        business_id: businessId ?? service?.business_id ?? '',
        customer_name: guest_name,
        customer_phone: phone,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        slots_booked: Number(num_guests) || 1,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'unpaid',
      },
    });

    await this.prisma.booking_guests.create({
      data: {
        booking_id: booking.booking_id,
        name: guest_name,
        phone,
        age: age ? Number(age) : null,
        num_guests: Number(num_guests) || 1,
        address: address ?? null,
        pin_code: pin_code ?? null,
      },
    });

    this.logger.log(`Booking created: ${booking.booking_id}`);

    return {
      screen: 'SUCCESS',
      data: {
        extension_message_response: {
          params: {
            flow_token: data.flow_token ?? '',
            booking_id: booking.booking_id,
            label_checkin,
            label_checkout,
            label_nights,
            label_total,
            guest_name,
          },
        },
      },
    };
  }

  private fetchImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      client.get(url, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
        res.on('error', () => resolve(''));
      }).on('error', () => resolve(''));
    });
  }
}
