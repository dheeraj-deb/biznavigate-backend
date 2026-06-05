import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  AppointmentAvailabilityWindowDto,
  AppointmentSalesListingDto,
  AppointmentSalesSlotsQueryDto,
  AppointmentSalesStaffDto,
  AppointmentSalesVisitsQueryDto,
  AssignAppointmentVisitDto,
  CompleteAppointmentSalesSetupDto,
  CreateAppointmentVisitDto,
  UpdateAppointmentListingStatusDto,
  UpdateAppointmentVisitStatusDto,
} from './dto/appointment-sales.dto';

type AuthUser = {
  business_id: string;
  tenant_id?: string;
  user_id?: string;
  business_type?: string;
};

type SlotCandidate = {
  staff_id: string;
  staff_name: string;
  staff_phone?: string | null;
  start: Date;
  end: Date;
  booked_count: number;
  available_count: number;
  capacity: number;
};

const VISIT_START_INTERVAL_MINUTES = 60;
const MAX_VISITS_PER_REQUESTED_TIME = 10;
const ACTIVE_LISTING_STATUS = 'available';

@Injectable()
export class AppointmentSalesService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(user: AuthUser) {
    const businessId = user.business_id;
    const todayStart = this.startOfLocalDay(new Date());
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [settings, listings, listingBreakdown, activeStaff, todayVisits, upcomingVisits, recentVisits] = await Promise.all([
      this.getSettings(user),
      this.prisma.catalog_items.count({
        where: {
          business_id: businessId,
          item_type: { in: ['vehicle', 'property'] },
          is_active: true,
          deleted_at: null,
        },
      }),
      this.requiredQuery<any>(
        `SELECT
           COUNT(*) FILTER (WHERE COALESCE(ci.attributes->>'listing_status', CASE WHEN ci.is_active THEN 'available' ELSE 'inactive' END) = 'available')::int AS available,
           COUNT(*) FILTER (WHERE ci.attributes->>'listing_status' = 'reserved')::int AS reserved,
           COUNT(*) FILTER (WHERE ci.attributes->>'listing_status' = 'sold')::int AS sold,
           COUNT(*) FILTER (WHERE ci.attributes->>'listing_status' = 'inactive' OR ci.is_active = FALSE)::int AS inactive,
           COUNT(*) FILTER (WHERE e.sync_status IN ('pending', 'pending_delete', 'failed'))::int AS sync_attention,
            COUNT(*) FILTER (
              WHERE ci.primary_image_url IS NULL
                 OR ci.description IS NULL
                 OR trim(COALESCE(ci.description, '')) = ''
                 OR ci.base_price IS NULL
                 OR ci.base_price <= 0
                 OR (
                   ci.item_type = 'vehicle'
                   AND (
                     vid.make IS NULL
                     OR vid.model_name IS NULL
                     OR vid.year IS NULL
                     OR (vid.registration_number IS NULL AND vid.rc_status IS NULL)
                     OR vid.insurance_valid_until IS NULL
                   )
                 )
                 OR (
                   ci.item_type = 'property'
                   AND (
                     pid.property_type IS NULL
                     OR (pid.locality IS NULL AND pid.city IS NULL)
                     OR (pid.map_url IS NULL AND pid.visit_landmark IS NULL)
                     OR pid.documents_status IS NULL
                   )
                 )
            )::int AS needs_details
         FROM catalog_items ci
         LEFT JOIN vehicle_item_details vid ON vid.item_id = ci.item_id
         LEFT JOIN property_item_details pid ON pid.item_id = ci.item_id
         LEFT JOIN LATERAL (
           SELECT sync_status
           FROM external_catalog_items e
           WHERE e.business_id = ci.business_id
             AND e.item_id = ci.item_id
             AND e.provider = 'whatsapp'
           ORDER BY e.updated_at DESC
           LIMIT 1
         ) e ON TRUE
         WHERE ci.business_id = $1
           AND ci.item_type IN ('vehicle', 'property')
           AND ci.deleted_at IS NULL`,
        [businessId],
      ),
      this.requiredQuery<any>(
        `SELECT COUNT(*)::int AS count
         FROM appointment_sales_staff
         WHERE business_id = $1 AND is_active = TRUE`,
        [businessId],
      ),
      this.requiredQuery<any>(
        `SELECT COUNT(*)::int AS count
         FROM appointment_sales_visits
         WHERE business_id = $1
           AND scheduled_start >= $2
           AND scheduled_start < $3
           AND status IN ('scheduled', 'confirmed', 'arrived')`,
        [businessId, todayStart, tomorrowStart],
      ),
      this.requiredQuery<any>(
        `SELECT COUNT(*)::int AS count
         FROM appointment_sales_visits
         WHERE business_id = $1
           AND scheduled_start >= now()
           AND status IN ('scheduled', 'confirmed', 'arrived')`,
        [businessId],
      ),
      this.listVisits(user, { limit: 6 }),
    ]);

    const vertical = settings.vertical_type;
    const noun = vertical === 'real_estate' ? 'property' : 'vehicle';
    const visitLabel = vertical === 'real_estate' ? 'site visits' : 'showroom visits';

    return {
      business_type: vertical,
      title: vertical === 'real_estate' ? 'Property Sales Desk' : 'Vehicle Sales Desk',
      summary: {
        active_listings: listings,
        active_staff: Number(activeStaff[0]?.count ?? 0),
        visits_today: Number(todayVisits[0]?.count ?? 0),
        upcoming_visits: Number(upcomingVisits[0]?.count ?? 0),
        reserved_listings: Number(listingBreakdown[0]?.reserved ?? 0),
        sold_listings: Number(listingBreakdown[0]?.sold ?? 0),
        inactive_listings: Number(listingBreakdown[0]?.inactive ?? 0),
        sync_attention: Number(listingBreakdown[0]?.sync_attention ?? 0),
        listings_needing_update: Number(listingBreakdown[0]?.needs_details ?? 0),
      },
      primary_actions: [
        { key: 'listings', label: `Add ${noun}`, count: listings },
        { key: 'staff', label: 'Sales staff', count: Number(activeStaff[0]?.count ?? 0) },
        { key: 'visits', label: 'Visits today', count: Number(todayVisits[0]?.count ?? 0) },
      ],
      ai_employees: [
        {
          key: 'sales',
          name: vertical === 'real_estate' ? 'AI Property Sales Employee' : 'AI Vehicle Sales Employee',
          status: 'watching',
          summary: `Shows listings, answers basic questions, and offers ${visitLabel}.`,
          next: `Offer the best available ${visitLabel.slice(0, -1)} slot when a buyer is interested.`,
          metrics: [
            { label: 'Upcoming visits', value: Number(upcomingVisits[0]?.count ?? 0), tone: 'good' },
            { label: 'Active listings', value: listings, tone: 'neutral' },
          ],
        },
        {
          key: 'staff_scheduler',
          name: 'AI Visit Scheduler',
          status: Number(activeStaff[0]?.count ?? 0) > 0 ? 'ready' : 'needs_setup',
          summary: 'Checks staff availability before giving slots to customers.',
          next: Number(activeStaff[0]?.count ?? 0) > 0 ? 'Ready to schedule visits' : 'Add at least one salesperson',
          metrics: [
            { label: 'Sales staff', value: Number(activeStaff[0]?.count ?? 0), tone: 'neutral' },
            { label: 'Today', value: Number(todayVisits[0]?.count ?? 0), tone: 'good' },
          ],
        },
      ],
      recent_visits: recentVisits,
      settings,
    };
  }

  async getSetup(user: AuthUser) {
    const settings = await this.getSettings(user);
    const [staff, listings] = await Promise.all([
      this.listStaff(user),
      this.listListings(user),
    ]);

    const checklist = {
      staff_added: staff.length > 0,
      availability_added: staff.some((person) => person.availability?.length > 0),
      listings_added: listings.length > 0,
      ready_for_visits: staff.length > 0 && staff.some((person) => person.availability?.length > 0),
    };

    return {
      settings,
      staff,
      listings,
      checklist,
      status: settings.onboarding_status ?? (checklist.ready_for_visits ? 'in_progress' : 'not_started'),
    };
  }

  async completeSetup(user: AuthUser, dto: CompleteAppointmentSalesSetupDto) {
    const tenantId = this.requireTenant(user);
    const vertical = await this.resolveVertical(user, dto.vertical_type);

    return this.prisma.$transaction(async (tx) => {
      const settings = await this.upsertSettings(tx, user, {
        ...dto,
        vertical_type: vertical,
        onboarding_status: 'completed',
      });

      const staffResults = [];
      for (const person of dto.staff ?? []) {
        staffResults.push(await this.upsertStaffRecord(tx, user, person));
      }

      const listingResults = [];
      for (const listing of dto.listings ?? []) {
        listingResults.push(await this.upsertListingRecord(tx, user, listing, vertical));
      }

      await tx.audit_logs.create({
        data: {
          business_id: user.business_id,
          user_id: user.user_id,
          action: 'appointment_sales_setup_completed',
          entity_type: 'appointment_sales_settings',
          entity_id: settings.appointment_sales_settings_id,
          new_values: {
            vertical_type: vertical,
            staff_count: staffResults.length,
            listing_count: listingResults.length,
          },
        },
      }).catch(() => undefined);

      return {
        settings,
        staff_created_or_updated: staffResults.length,
        listings_created_or_updated: listingResults.length,
        tenant_id: tenantId,
        next: '/appointment-sales',
      };
    });
  }

  async listListings(user: AuthUser) {
    const vertical = await this.resolveVertical(user);
    const itemType = vertical === 'real_estate' ? 'property' : 'vehicle';
    const rows = await this.requiredQuery<any>(
      `SELECT
         ci.*,
         row_to_json(vid.*) AS vehicle,
         row_to_json(pid.*) AS property,
         wa.sync_status AS whatsapp_sync_status,
         wa.last_synced_at AS whatsapp_last_synced_at,
         wa.external_product_id AS whatsapp_external_product_id,
         wa.retailer_id AS whatsapp_retailer_id
       FROM catalog_items ci
       LEFT JOIN vehicle_item_details vid ON vid.item_id = ci.item_id
       LEFT JOIN property_item_details pid ON pid.item_id = ci.item_id
       LEFT JOIN LATERAL (
         SELECT sync_status, last_synced_at, external_product_id, retailer_id
         FROM external_catalog_items e
         WHERE e.business_id = ci.business_id
           AND e.item_id = ci.item_id
           AND e.provider = 'whatsapp'
         ORDER BY e.updated_at DESC
         LIMIT 1
       ) wa ON TRUE
       WHERE ci.business_id = $1
         AND ci.item_type = $2
         AND ci.deleted_at IS NULL
       ORDER BY ci.created_at DESC
       LIMIT 100`,
      [user.business_id, itemType],
    );

    return rows.map((item) => {
      const vehicle = item.vehicle ?? {};
      const property = item.property ?? {};
      const attributes = item.attributes ?? {};
      const listing = {
        item_id: item.item_id,
        name: item.name,
        description: item.description,
        category: item.category,
        price: this.toNumber(item.base_price),
        currency: item.currency,
        primary_image_url: item.primary_image_url,
        image_urls: item.image_urls,
        is_active: item.is_active,
        status: attributes.listing_status ?? (item.is_active ? 'available' : 'inactive'),
        whatsapp_sync_status: item.whatsapp_sync_status ?? 'not_synced',
        whatsapp_last_synced_at: item.whatsapp_last_synced_at,
        whatsapp_external_product_id: item.whatsapp_external_product_id,
        whatsapp_retailer_id: item.whatsapp_retailer_id,
        item_type: item.item_type,
        attributes,
        make: vehicle.make,
        model_name: vehicle.model_name,
        year: vehicle.year,
        fuel_type: vehicle.fuel_type,
        transmission: vehicle.transmission,
        color: vehicle.color,
        km_driven: vehicle.km_driven,
        condition: vehicle.condition,
        ownership_count: vehicle.ownership_count,
        insurance_valid_until: vehicle.insurance_valid_until,
        registration_number: vehicle.registration_number,
        rc_status: vehicle.rc_status,
        finance_available: vehicle.finance_available,
        exchange_accepted: vehicle.exchange_accepted,
        accident_history: vehicle.accident_history,
        service_history: vehicle.service_history,
        test_drive_available: vehicle.test_drive_available,
        property_type: property.property_type,
        listing_type: property.listing_type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_sqft: property.area_sqft,
        floor_number: property.floor_number,
        total_floors: property.total_floors,
        locality: property.locality,
        city: property.city,
        furnishing: property.furnishing,
        possession_status: property.possession_status,
        facing: property.facing,
        parking: property.parking,
        rera_id: property.rera_id,
        map_url: property.map_url,
        documents_status: property.documents_status,
        loan_support_available: property.loan_support_available,
        visit_landmark: property.visit_landmark,
        vehicle: item.vehicle,
        property: item.property,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
      const readinessMissing = this.buildListingReadiness(listing, vertical);
      return {
        ...listing,
        readiness_missing: readinessMissing,
        is_ready_for_whatsapp: readinessMissing.length === 0,
      };
    });
  }

  async upsertListing(user: AuthUser, dto: AppointmentSalesListingDto) {
    const vertical = await this.resolveVertical(user);
    return this.prisma.$transaction((tx) => this.upsertListingRecord(tx, user, dto, vertical));
  }

  async updateListingStatus(user: AuthUser, itemId: string, dto: UpdateAppointmentListingStatusDto) {
    const vertical = await this.resolveVertical(user);
    const itemType = vertical === 'real_estate' ? 'property' : 'vehicle';
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.catalog_items.findFirst({
        where: {
          business_id: user.business_id,
          item_id: itemId,
          item_type: itemType,
          deleted_at: null,
        },
      });
      if (!item) throw new NotFoundException('Listing not found');

      const attributes = {
        ...((item.attributes as any) ?? {}),
        listing_status: dto.status,
      };
      const rows = await tx.$queryRawUnsafe(
        `UPDATE catalog_items
         SET is_active = $3,
             stock_quantity = CASE WHEN item_type = 'vehicle' THEN $4 ELSE stock_quantity END,
             attributes = $5::jsonb,
             updated_at = now()
         WHERE business_id = $1 AND item_id = $2
         RETURNING item_id, name, item_type, base_price, is_active, attributes`,
        user.business_id,
        itemId,
        dto.status === ACTIVE_LISTING_STATUS,
        dto.status === ACTIVE_LISTING_STATUS ? 1 : 0,
        JSON.stringify(attributes),
      ) as any[];

      if (dto.status === ACTIVE_LISTING_STATUS) {
        await this.queueWhatsAppCatalogSync(tx, user.business_id, itemId);
      } else {
        await this.markWhatsAppCatalogDeletePending(tx, user.business_id, itemId);
      }
      return {
        ...rows[0],
        status: dto.status,
        price: this.toNumber(rows[0]?.base_price),
      };
    }).catch((error) => this.handleMutationError(error));
  }

  async deleteListing(user: AuthUser, itemId: string) {
    const vertical = await this.resolveVertical(user);
    const itemType = vertical === 'real_estate' ? 'property' : 'vehicle';
    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRawUnsafe(
        `UPDATE catalog_items
         SET deleted_at = now(),
             is_active = FALSE,
             stock_quantity = CASE WHEN item_type = 'vehicle' THEN 0 ELSE stock_quantity END,
             attributes = COALESCE(attributes, '{}'::jsonb) || $4::jsonb,
             updated_at = now()
         WHERE business_id = $1
           AND item_id = $2
           AND item_type = $3
           AND deleted_at IS NULL
         RETURNING item_id, name, item_type`,
        user.business_id,
        itemId,
        itemType,
        JSON.stringify({ listing_status: 'inactive', deleted_by_owner: true }),
      ) as any[];
      if (!rows[0]) throw new NotFoundException('Listing not found');

      await this.markWhatsAppCatalogDeletePending(tx, user.business_id, itemId);
      return { ...rows[0], deleted: true };
    }).catch((error) => this.handleMutationError(error));
  }

  async listStaff(user: AuthUser) {
    const rows = await this.requiredQuery<any>(
      `SELECT *
       FROM appointment_sales_staff
       WHERE business_id = $1
       ORDER BY is_active DESC, priority ASC, created_at ASC`,
      [user.business_id],
    );
    if (!rows.length) return [];

    const availabilityRows = await this.requiredQuery<any>(
      `SELECT *
       FROM appointment_sales_staff_availability
       WHERE business_id = $1
         AND sales_staff_id = ANY($2::uuid[])
       ORDER BY day_of_week ASC,
         CASE window_type WHEN 'working' THEN 0 WHEN 'lunch' THEN 1 WHEN 'break' THEN 2 ELSE 3 END,
         start_time ASC`,
      [user.business_id, rows.map((row) => row.sales_staff_id)],
    );
    const availabilityByStaff = new Map<string, any[]>();
    for (const row of availabilityRows) {
      const list = availabilityByStaff.get(row.sales_staff_id) ?? [];
      list.push(row);
      availabilityByStaff.set(row.sales_staff_id, list);
    }

    return rows.map((row) => ({
      ...row,
      availability: availabilityByStaff.get(row.sales_staff_id) ?? [],
    }));
  }

  async upsertStaff(user: AuthUser, dto: AppointmentSalesStaffDto) {
    return this.prisma.$transaction((tx) => this.upsertStaffRecord(tx, user, dto));
  }

  async updateStaff(user: AuthUser, staffId: string, dto: AppointmentSalesStaffDto) {
    return this.upsertStaff(user, { ...dto, sales_staff_id: staffId });
  }

  async replaceStaffAvailability(
    user: AuthUser,
    staffId: string,
    availability: AppointmentAvailabilityWindowDto[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const staff = await this.findStaffForUpdate(tx, user.business_id, staffId);
      await this.replaceAvailability(tx, user.business_id, staff.sales_staff_id, availability);
      return {
        ...staff,
        availability: await this.getAvailabilityForStaff(tx, user.business_id, staff.sales_staff_id),
      };
    });
  }

  async getVisitSlots(user: AuthUser, query: AppointmentSalesSlotsQueryDto) {
    const settings = await this.getSettings(user);
    const duration = query.duration_minutes ?? settings.slot_duration_minutes ?? 45;
    const date = this.parseDateOnly(query.date);
    const dayOfWeek = date.getDay();

    const slots = await this.generateVisitSlots(
      this.prisma,
      user.business_id,
      query.date,
      dayOfWeek,
      duration,
      query.sales_staff_id,
    );

    return {
      date: query.date,
      duration_minutes: duration,
      buffer_minutes: 0,
      item_id: query.item_id,
      slots: slots.map((slot) => ({
        sales_staff_id: slot.staff_id,
        sales_staff_name: slot.staff_name,
        sales_staff_phone: slot.staff_phone,
        start: slot.start.toISOString(),
        end: slot.end.toISOString(),
        label: this.slotLabel(slot.start),
        booked_count: slot.booked_count,
        available_count: slot.available_count,
        capacity: slot.capacity,
      })),
    };
  }

  async listVisits(user: AuthUser, query: AppointmentSalesVisitsQueryDto = {}) {
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 50)));
    const where: string[] = ['v.business_id = $1'];
    const params: any[] = [user.business_id];

    if (query.status) {
      params.push(query.status);
      where.push(`v.status = $${params.length}`);
    }
    if (query.from_date) {
      params.push(new Date(query.from_date));
      where.push(`v.scheduled_start >= $${params.length}`);
    }
    if (query.to_date) {
      params.push(new Date(query.to_date));
      where.push(`v.scheduled_start <= $${params.length}`);
    }
    params.push(limit);

    return this.requiredQuery<any>(
      `SELECT
         v.*,
         s.name AS sales_staff_name,
         s.phone AS sales_staff_phone,
         ci.name AS item_name,
         ci.item_type,
         ci.base_price
       FROM appointment_sales_visits v
       LEFT JOIN appointment_sales_staff s ON s.sales_staff_id = v.sales_staff_id
       LEFT JOIN catalog_items ci ON ci.item_id = v.item_id
       WHERE ${where.join(' AND ')}
       ORDER BY v.scheduled_start DESC
       LIMIT $${params.length}`,
      params,
    );
  }

  async createVisit(user: AuthUser, dto: CreateAppointmentVisitDto) {
    const settings = await this.getSettings(user);
    const tenantId = this.requireTenant(user);
    const duration = dto.duration_minutes ?? settings.slot_duration_minutes ?? 45;
    const scheduledStart = new Date(dto.scheduled_start);
    if (Number.isNaN(scheduledStart.getTime())) throw new BadRequestException('Invalid visit start time');
    const scheduledEnd = new Date(scheduledStart.getTime() + duration * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      if (dto.item_id) {
        const item = await tx.catalog_items.findFirst({
          where: {
            business_id: user.business_id,
            item_id: dto.item_id,
            item_type: { in: ['vehicle', 'property'] },
            deleted_at: null,
          },
          select: { item_id: true },
        });
        if (!item) throw new NotFoundException('Listing not found');
      }

      let customerId = dto.customer_id ?? null;
      if (!customerId && dto.customer_phone) {
        const customer = await this.findOrCreateCustomer(
          tx,
          user.business_id,
          tenantId,
          dto.customer_phone,
          dto.customer_name,
        );
        customerId = customer.customer_id;
      }

      await this.ensureVisitTimeHasCapacity(tx, user.business_id, scheduledStart);

      const staff = await this.findAvailableStaffForSlot(
        tx,
        user.business_id,
        scheduledStart,
        scheduledEnd,
        dto.sales_staff_id,
      );
      if (!staff) throw new ConflictException('No salesperson is available at this time');

      const rows = await tx.$queryRawUnsafe(
        `INSERT INTO appointment_sales_visits
           (business_id, tenant_id, lead_id, customer_id, item_id, sales_staff_id, visit_type,
            scheduled_start, scheduled_end, customer_name, customer_phone, location, source, notes, created_by, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16::jsonb)
         RETURNING *`,
        user.business_id,
        tenantId,
        dto.lead_id ?? null,
        customerId,
        dto.item_id ?? null,
        staff.sales_staff_id,
        dto.visit_type ?? settings.default_visit_type ?? 'showroom_visit',
        scheduledStart,
        scheduledEnd,
        dto.customer_name ?? null,
        dto.customer_phone ? this.normalizePhone(dto.customer_phone) : null,
        dto.location ?? settings.default_visit_location ?? null,
        dto.source ?? 'owner',
        dto.notes ?? null,
        user.user_id ?? null,
        JSON.stringify({
          auto_assigned: !dto.sales_staff_id,
          sales_staff_name: staff.name,
        }),
      ) as any[];

      return rows[0];
    }).catch((error) => this.handleMutationError(error));
  }

  async updateVisitStatus(user: AuthUser, visitId: string, dto: UpdateAppointmentVisitStatusDto) {
    const rows = await this.requiredQuery<any>(
      `UPDATE appointment_sales_visits
       SET status = $3,
           notes = COALESCE($4, notes),
           updated_at = now(),
           metadata = COALESCE(metadata, '{}'::jsonb) || $5::jsonb
       WHERE business_id = $1 AND visit_id = $2
       RETURNING *`,
      [
        user.business_id,
        visitId,
        dto.status,
        dto.notes ?? null,
        JSON.stringify({ status_note: dto.notes ?? null, updated_by: user.user_id ?? null }),
      ],
    );
    if (!rows[0]) throw new NotFoundException('Visit not found');
    return rows[0];
  }

  async assignVisit(user: AuthUser, visitId: string, dto: AssignAppointmentVisitDto) {
    return this.prisma.$transaction(async (tx) => {
      const visits = await tx.$queryRawUnsafe(
        `SELECT *
         FROM appointment_sales_visits
         WHERE business_id = $1 AND visit_id = $2
         FOR UPDATE`,
        user.business_id,
        visitId,
      ) as any[];
      const visit = visits[0];
      if (!visit) throw new NotFoundException('Visit not found');
      if (!['scheduled', 'confirmed', 'arrived'].includes(visit.status)) {
        throw new BadRequestException('Only active visits can be reassigned');
      }

      const staff = await this.findAvailableStaffForSlot(
        tx,
        user.business_id,
        new Date(visit.scheduled_start),
        new Date(visit.scheduled_end),
        dto.sales_staff_id,
        visit.visit_id,
      );
      if (!staff) throw new ConflictException('No salesperson is available for this visit time');

      const rows = await tx.$queryRawUnsafe(
        `UPDATE appointment_sales_visits
         SET sales_staff_id = $3,
             notes = COALESCE($4, notes),
             updated_at = now(),
             metadata = COALESCE(metadata, '{}'::jsonb) || $5::jsonb
         WHERE business_id = $1 AND visit_id = $2
         RETURNING *`,
        user.business_id,
        visitId,
        staff.sales_staff_id,
        dto.notes ?? null,
        JSON.stringify({
          reassigned_by: user.user_id ?? null,
          reassigned_at: new Date().toISOString(),
          sales_staff_name: staff.name,
          auto_assigned: !dto.sales_staff_id,
        }),
      ) as any[];

      return {
        ...rows[0],
        sales_staff_name: staff.name,
        sales_staff_phone: staff.phone,
      };
    }).catch((error) => this.handleMutationError(error));
  }

  private async getSettings(user: AuthUser) {
    const rows = await this.optionalQuery<any>(
      `SELECT *
       FROM appointment_sales_settings
       WHERE business_id = $1
       LIMIT 1`,
      [user.business_id],
    );
    if (rows[0]) {
      return {
        ...rows[0],
        max_visits_per_time: MAX_VISITS_PER_REQUESTED_TIME,
      };
    }

    const vertical = await this.resolveVertical(user);
    return {
      vertical_type: vertical,
      onboarding_status: 'not_started',
      default_visit_type: vertical === 'real_estate' ? 'site_visit' : 'showroom_visit',
      default_visit_location: null,
      slot_duration_minutes: vertical === 'real_estate' ? 60 : 45,
      visit_buffer_minutes: 0,
      auto_assign_visits: true,
      reminder_minutes_before: 60,
      max_visits_per_time: MAX_VISITS_PER_REQUESTED_TIME,
    };
  }

  private async upsertSettings(db: any, user: AuthUser, dto: CompleteAppointmentSalesSetupDto & { onboarding_status?: string }) {
    const rows = await db.$queryRawUnsafe(
      `INSERT INTO appointment_sales_settings
         (business_id, tenant_id, vertical_type, onboarding_status, default_visit_type,
          default_visit_location, slot_duration_minutes, visit_buffer_minutes,
          auto_assign_visits, reminder_minutes_before, setup_checklist, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12::jsonb)
       ON CONFLICT (business_id) DO UPDATE SET
         tenant_id = EXCLUDED.tenant_id,
         vertical_type = EXCLUDED.vertical_type,
         onboarding_status = EXCLUDED.onboarding_status,
         default_visit_type = EXCLUDED.default_visit_type,
         default_visit_location = EXCLUDED.default_visit_location,
         slot_duration_minutes = EXCLUDED.slot_duration_minutes,
         visit_buffer_minutes = EXCLUDED.visit_buffer_minutes,
         auto_assign_visits = EXCLUDED.auto_assign_visits,
         reminder_minutes_before = EXCLUDED.reminder_minutes_before,
         setup_checklist = EXCLUDED.setup_checklist,
         metadata = EXCLUDED.metadata,
         updated_at = now()
       RETURNING *`,
      user.business_id,
      user.tenant_id ?? null,
      dto.vertical_type,
      dto.onboarding_status ?? 'completed',
      dto.default_visit_type ?? (dto.vertical_type === 'real_estate' ? 'site_visit' : 'showroom_visit'),
      dto.default_visit_location ?? null,
      dto.slot_duration_minutes ?? (dto.vertical_type === 'real_estate' ? 60 : 45),
      0,
      dto.auto_assign_visits ?? true,
      dto.reminder_minutes_before ?? 60,
      JSON.stringify({
        staff_added: Boolean(dto.staff?.length),
        listings_added: Boolean(dto.listings?.length),
      }),
      JSON.stringify({
        completed_by: user.user_id ?? null,
        completed_at: new Date().toISOString(),
      }),
    ) as any[];
    return rows[0];
  }

  private async upsertStaffRecord(db: any, user: AuthUser, dto: AppointmentSalesStaffDto) {
    const staffId = dto.sales_staff_id ?? null;
    const rows = await db.$queryRawUnsafe(
      `INSERT INTO appointment_sales_staff
         (sales_staff_id, business_id, tenant_id, name, phone, email, role, title, priority, is_active, created_by, metadata)
       VALUES (COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
       ON CONFLICT (sales_staff_id) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         email = EXCLUDED.email,
         role = EXCLUDED.role,
         title = EXCLUDED.title,
         priority = EXCLUDED.priority,
         is_active = EXCLUDED.is_active,
         metadata = EXCLUDED.metadata,
         updated_at = now()
       RETURNING *`,
      staffId,
      user.business_id,
      user.tenant_id ?? null,
      dto.name.trim(),
      dto.phone ? this.normalizePhone(dto.phone) : null,
      dto.email ?? null,
      dto.role ?? 'sales_consultant',
      dto.title ?? null,
      dto.priority ?? 1,
      dto.is_active ?? true,
      user.user_id ?? null,
      JSON.stringify({ source: 'appointment_sales_setup' }),
    ) as any[];
    const staff = rows[0];
    if (dto.availability?.length) {
      await this.replaceAvailability(db, user.business_id, staff.sales_staff_id, dto.availability);
    } else if (!staffId) {
      await this.replaceAvailability(db, user.business_id, staff.sales_staff_id, this.defaultAvailability());
    }

    return {
      ...staff,
      availability: await this.getAvailabilityForStaff(db, user.business_id, staff.sales_staff_id),
    };
  }

  private async findStaffForUpdate(db: any, businessId: string, staffId: string) {
    const rows = await db.$queryRawUnsafe(
      `SELECT *
       FROM appointment_sales_staff
       WHERE business_id = $1 AND sales_staff_id = $2
       FOR UPDATE`,
      businessId,
      staffId,
    ) as any[];
    if (!rows[0]) throw new NotFoundException('Salesperson not found');
    return rows[0];
  }

  private async replaceAvailability(
    db: any,
    businessId: string,
    staffId: string,
    availability: AppointmentAvailabilityWindowDto[],
  ) {
    await db.$queryRawUnsafe(
      `DELETE FROM appointment_sales_staff_availability
       WHERE business_id = $1 AND sales_staff_id = $2`,
      businessId,
      staffId,
    );

    for (const window of availability) {
      this.assertTimeWindow(window.start_time, window.end_time);
      await db.$queryRawUnsafe(
        `INSERT INTO appointment_sales_staff_availability
           (sales_staff_id, business_id, day_of_week, start_time, end_time, window_type, label, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        staffId,
        businessId,
        window.day_of_week,
        window.start_time,
        window.end_time,
        window.window_type ?? 'working',
        window.label ?? null,
        window.is_active ?? true,
      );
    }
  }

  private async getAvailabilityForStaff(db: any, businessId: string, staffId: string) {
    return db.$queryRawUnsafe(
      `SELECT *
       FROM appointment_sales_staff_availability
       WHERE business_id = $1 AND sales_staff_id = $2
       ORDER BY day_of_week ASC,
         CASE window_type WHEN 'working' THEN 0 WHEN 'lunch' THEN 1 WHEN 'break' THEN 2 ELSE 3 END,
         start_time ASC`,
      businessId,
      staffId,
    ) as Promise<any[]>;
  }

  private async upsertListingRecord(
    db: any,
    user: AuthUser,
    dto: AppointmentSalesListingDto,
    vertical: string,
  ) {
    const tenantId = this.requireTenant(user);
    const itemType = vertical === 'real_estate' ? 'property' : 'vehicle';
    const name = dto.name.trim();
    if (!name) throw new BadRequestException('Listing name is required');
    const listingStatus = this.normalizeListingStatus(dto.status);
    const attributes = this.buildListingAttributes(dto, vertical, listingStatus);

    let item: any;
    if (dto.item_id) {
      const existing = await db.catalog_items.findFirst({
        where: {
          business_id: user.business_id,
          item_id: dto.item_id,
          item_type: itemType,
          deleted_at: null,
        },
      });
      if (!existing) throw new NotFoundException('Listing not found');

      item = await db.catalog_items.update({
        where: { item_id: dto.item_id },
        data: {
          name,
          description: dto.description ?? null,
          category: dto.category ?? null,
          base_price: dto.price,
          primary_image_url: dto.primary_image_url ?? null,
          image_urls: dto.image_urls ?? undefined,
          attributes,
          ai_tags: this.buildListingTags(dto, vertical),
          stock_quantity: itemType === 'vehicle' ? (listingStatus === ACTIVE_LISTING_STATUS ? 1 : 0) : undefined,
          is_active: listingStatus === ACTIVE_LISTING_STATUS,
          updated_at: new Date(),
        },
      });
    } else {
      item = await db.catalog_items.create({
        data: {
          business_id: user.business_id,
          tenant_id: tenantId,
          item_type: itemType,
          name,
          description: dto.description ?? null,
          category: dto.category ?? null,
          base_price: dto.price,
          currency: 'INR',
          stock_quantity: itemType === 'vehicle' ? (listingStatus === ACTIVE_LISTING_STATUS ? 1 : 0) : null,
          primary_image_url: dto.primary_image_url ?? null,
          image_urls: dto.image_urls ?? undefined,
          attributes,
          ai_tags: this.buildListingTags(dto, vertical),
          is_active: listingStatus === ACTIVE_LISTING_STATUS,
        },
      });
    }

    if (vertical === 'real_estate') {
      await db.$queryRawUnsafe(
        `INSERT INTO property_item_details
           (item_id, business_id, property_type, listing_type, bedrooms, bathrooms, area_sqft,
            floor_number, total_floors, locality, city, furnishing, possession_status, facing,
            parking, rera_id, map_url, documents_status, loan_support_available, visit_landmark, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                 $14, $15, $16, $17, $18, $19, $20, $21::jsonb)
         ON CONFLICT (item_id) DO UPDATE SET
           property_type = EXCLUDED.property_type,
           listing_type = EXCLUDED.listing_type,
           bedrooms = EXCLUDED.bedrooms,
           bathrooms = EXCLUDED.bathrooms,
           area_sqft = EXCLUDED.area_sqft,
           floor_number = EXCLUDED.floor_number,
           total_floors = EXCLUDED.total_floors,
           locality = EXCLUDED.locality,
           city = EXCLUDED.city,
           furnishing = EXCLUDED.furnishing,
           possession_status = EXCLUDED.possession_status,
           facing = EXCLUDED.facing,
           parking = EXCLUDED.parking,
           rera_id = EXCLUDED.rera_id,
           map_url = EXCLUDED.map_url,
           documents_status = EXCLUDED.documents_status,
           loan_support_available = EXCLUDED.loan_support_available,
           visit_landmark = EXCLUDED.visit_landmark,
           metadata = EXCLUDED.metadata,
           updated_at = now()`,
        item.item_id,
        user.business_id,
        dto.property_type ?? 'flat',
        dto.listing_type ?? 'sale',
        dto.bedrooms ?? null,
        dto.bathrooms ?? null,
        dto.area_sqft ?? null,
        dto.floor_number ?? null,
        dto.total_floors ?? null,
        dto.locality ?? null,
        dto.city ?? null,
        dto.furnishing ?? null,
        dto.possession_status ?? null,
        dto.facing ?? null,
        dto.parking ?? null,
        dto.rera_id ?? null,
        dto.map_url ?? null,
        dto.documents_status ?? null,
        dto.loan_support_available ?? false,
        dto.visit_landmark ?? null,
        JSON.stringify({ source: 'appointment_sales_setup', listing_status: listingStatus }),
      );
    } else {
      await db.$queryRawUnsafe(
        `INSERT INTO vehicle_item_details
           (item_id, business_id, make, model_name, year, fuel_type, transmission, color, km_driven, condition,
            ownership_count, insurance_valid_until, registration_number, rc_status, finance_available,
            exchange_accepted, accident_history, service_history, test_drive_available, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                 $11, $12, $13, $14, $15, $16, $17, $18, $19, $20::jsonb)
         ON CONFLICT (item_id) DO UPDATE SET
           make = EXCLUDED.make,
           model_name = EXCLUDED.model_name,
           year = EXCLUDED.year,
           fuel_type = EXCLUDED.fuel_type,
           transmission = EXCLUDED.transmission,
           color = EXCLUDED.color,
           km_driven = EXCLUDED.km_driven,
           condition = EXCLUDED.condition,
           ownership_count = EXCLUDED.ownership_count,
           insurance_valid_until = EXCLUDED.insurance_valid_until,
           registration_number = EXCLUDED.registration_number,
           rc_status = EXCLUDED.rc_status,
           finance_available = EXCLUDED.finance_available,
           exchange_accepted = EXCLUDED.exchange_accepted,
           accident_history = EXCLUDED.accident_history,
           service_history = EXCLUDED.service_history,
           test_drive_available = EXCLUDED.test_drive_available,
           metadata = EXCLUDED.metadata,
           updated_at = now()`,
        item.item_id,
        user.business_id,
        dto.make ?? dto.category ?? 'Vehicle',
        dto.model_name ?? name,
        dto.year ?? new Date().getFullYear(),
        dto.fuel_type ?? null,
        dto.transmission ?? null,
        dto.color ?? null,
        dto.km_driven ?? null,
        dto.condition ?? 'used',
        dto.ownership_count ?? null,
        this.toDateOnly(dto.insurance_valid_until),
        dto.registration_number ?? null,
        dto.rc_status ?? null,
        dto.finance_available ?? false,
        dto.exchange_accepted ?? false,
        dto.accident_history ?? null,
        dto.service_history ?? null,
        dto.test_drive_available ?? true,
        JSON.stringify({ source: 'appointment_sales_setup', listing_status: listingStatus }),
      );
    }

    await this.queueWhatsAppCatalogSync(db, user.business_id, item.item_id);

    return {
      item_id: item.item_id,
      name: item.name,
      item_type: item.item_type,
      status: listingStatus,
      price: this.toNumber(item.base_price),
    };
  }

  private buildListingAttributes(dto: AppointmentSalesListingDto, vertical: string, listingStatus = ACTIVE_LISTING_STATUS) {
    if (vertical === 'real_estate') {
      return {
        vertical,
        listing_status: listingStatus,
        property_type: dto.property_type ?? 'flat',
        listing_type: dto.listing_type ?? 'sale',
        bedrooms: dto.bedrooms ?? null,
        bathrooms: dto.bathrooms ?? null,
        area_sqft: dto.area_sqft ?? null,
        floor_number: dto.floor_number ?? null,
        total_floors: dto.total_floors ?? null,
        locality: dto.locality ?? null,
        city: dto.city ?? null,
        furnishing: dto.furnishing ?? null,
        possession_status: dto.possession_status ?? null,
        facing: dto.facing ?? null,
        parking: dto.parking ?? null,
        rera_id: dto.rera_id ?? null,
        map_url: dto.map_url ?? null,
        documents_status: dto.documents_status ?? null,
        loan_support_available: dto.loan_support_available ?? false,
        visit_landmark: dto.visit_landmark ?? null,
      };
    }

    return {
      vertical,
      listing_status: listingStatus,
      make: dto.make ?? null,
      model_name: dto.model_name ?? null,
      year: dto.year ?? null,
      fuel_type: dto.fuel_type ?? null,
      transmission: dto.transmission ?? null,
      color: dto.color ?? null,
      km_driven: dto.km_driven ?? null,
      condition: dto.condition ?? 'used',
      ownership_count: dto.ownership_count ?? null,
      insurance_valid_until: dto.insurance_valid_until ?? null,
      registration_number: dto.registration_number ?? null,
      rc_status: dto.rc_status ?? null,
      finance_available: dto.finance_available ?? false,
      exchange_accepted: dto.exchange_accepted ?? false,
      accident_history: dto.accident_history ?? null,
      service_history: dto.service_history ?? null,
      test_drive_available: dto.test_drive_available ?? true,
    };
  }

  private buildListingTags(dto: AppointmentSalesListingDto, vertical: string) {
    return [
      dto.name,
      dto.category,
      dto.description,
      vertical,
      dto.make,
      dto.model_name,
      dto.fuel_type,
      dto.transmission,
      dto.color,
      dto.registration_number,
      dto.rc_status,
      dto.accident_history,
      dto.property_type,
      dto.listing_type,
      dto.locality,
      dto.city,
      dto.furnishing,
      dto.facing,
      dto.parking,
      dto.documents_status,
      dto.visit_landmark,
    ]
      .filter(Boolean)
      .flatMap((value) => String(value).toLowerCase().split(/[,\s]+/))
      .filter((value, index, values) => value.length > 1 && values.indexOf(value) === index)
      .slice(0, 30);
  }

  private async findAvailableStaffForSlot(
    db: any,
    businessId: string,
    start: Date,
    end: Date,
    preferredStaffId?: string,
    excludeVisitId?: string,
  ) {
    const dayOfWeek = start.getDay();
    const time = this.localTime(start);
    const rows = await db.$queryRawUnsafe(
      `SELECT s.*, COALESCE(load.booked_count, 0)::int AS booked_count
       FROM appointment_sales_staff s
       JOIN appointment_sales_staff_availability a
         ON a.sales_staff_id = s.sales_staff_id
        AND a.business_id = s.business_id
        AND a.is_active = TRUE
       LEFT JOIN LATERAL (
         SELECT COUNT(*)::int AS booked_count
         FROM appointment_sales_visits v
         WHERE v.business_id = s.business_id
           AND v.sales_staff_id = s.sales_staff_id
           AND ($6::uuid IS NULL OR v.visit_id <> $6::uuid)
           AND v.status IN ('scheduled', 'confirmed', 'arrived')
           AND v.scheduled_start = $7
       ) load ON TRUE
       WHERE s.business_id = $1
         AND s.is_active = TRUE
         AND ($2::uuid IS NULL OR s.sales_staff_id = $2::uuid)
         AND a.day_of_week = $3
         AND a.window_type = 'working'
         AND a.start_time <= $4
         AND a.end_time > $4
         AND NOT EXISTS (
            SELECT 1
            FROM appointment_sales_staff_availability b
           WHERE b.business_id = s.business_id
             AND b.sales_staff_id = s.sales_staff_id
             AND b.day_of_week = $3
             AND b.is_active = TRUE
             AND b.window_type IN ('lunch', 'break', 'blocked')
             AND b.start_time <= $4
              AND b.end_time > $4
          )
        ORDER BY COALESCE(load.booked_count, 0) ASC, s.priority ASC, s.created_at ASC
        FOR UPDATE OF s`,
      businessId,
      preferredStaffId ?? null,
      dayOfWeek,
      time,
      this.localTime(end),
      excludeVisitId ?? null,
      start,
    ) as any[];

    return rows[0] ?? null;
  }

  private async ensureVisitTimeHasCapacity(db: any, businessId: string, start: Date) {
    await db.$queryRawUnsafe(
      `SELECT pg_advisory_xact_lock(hashtextextended($1::text, 0::bigint))`,
      `${businessId}:${start.toISOString()}`,
    );

    const rows = await db.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS booked_count
       FROM appointment_sales_visits
       WHERE business_id = $1
         AND scheduled_start = $2
         AND status IN ('scheduled', 'confirmed', 'arrived')`,
      businessId,
      start,
    ) as any[];
    const bookedCount = Number(rows[0]?.booked_count ?? 0);
    if (bookedCount >= MAX_VISITS_PER_REQUESTED_TIME) {
      const suggestedStart = new Date(start.getTime() + 60 * 60 * 1000);
      throw new ConflictException(
        `This time already has ${MAX_VISITS_PER_REQUESTED_TIME} visits. Please ask the customer if ${this.slotLabel(suggestedStart)} is okay.`,
      );
    }
  }

  private async queueWhatsAppCatalogSync(db: any, businessId: string, itemId: string) {
    const readiness = await this.getListingSyncReadiness(db, businessId, itemId);
    const nextStatus = readiness.ready ? 'pending' : 'needs_review';
    const existing = await db.external_catalog_items.findFirst({
      where: {
        business_id: businessId,
        item_id: itemId,
        provider: 'whatsapp',
      },
      orderBy: { updated_at: 'desc' },
    });

    if (existing) {
      await db.external_catalog_items.update({
        where: { external_catalog_item_id: existing.external_catalog_item_id },
        data: {
          sync_status: existing.sync_status === 'local_only' ? 'local_only' : nextStatus,
          raw_payload: {
            ...((existing.raw_payload as any) ?? {}),
            readiness_missing: readiness.missing,
          },
          updated_at: new Date(),
        },
      });
      return;
    }

    await db.external_catalog_items.create({
      data: {
        business_id: businessId,
        item_id: itemId,
        provider: 'whatsapp',
        external_product_id: itemId,
        retailer_id: itemId,
        sync_status: nextStatus,
        raw_payload: {
          source: 'appointment_sales_listing',
          readiness_missing: readiness.missing,
        },
      },
    });
  }

  private async markWhatsAppCatalogDeletePending(db: any, businessId: string, itemId: string) {
    await db.external_catalog_items.updateMany({
      where: {
        business_id: businessId,
        item_id: itemId,
        provider: 'whatsapp',
      },
      data: {
        sync_status: 'pending_delete',
        updated_at: new Date(),
      },
    });
  }

  private normalizeListingStatus(status?: string) {
    if (status === 'reserved' || status === 'sold' || status === 'inactive') return status;
    return ACTIVE_LISTING_STATUS;
  }

  private buildListingReadiness(listing: any, vertical: string) {
    const missing: string[] = [];
    const hasText = (value: any) => typeof value === 'string' ? value.trim().length > 0 : Boolean(value);

    if (!hasText(listing.primary_image_url)) missing.push('photo');
    if (this.toNumber(listing.price ?? listing.base_price) <= 0) missing.push('price');
    if (!hasText(listing.description)) missing.push('description');

    if (vertical === 'real_estate') {
      if (!hasText(listing.property_type)) missing.push('property type');
      if (!hasText(listing.locality) && !hasText(listing.city)) missing.push('location');
      if (!hasText(listing.map_url) && !hasText(listing.visit_landmark)) missing.push('map or landmark');
      if (!hasText(listing.documents_status)) missing.push('documents');
      return missing;
    }

    if (!hasText(listing.make)) missing.push('make');
    if (!hasText(listing.model_name)) missing.push('model');
    if (!listing.year) missing.push('year');
    if (listing.km_driven === null || listing.km_driven === undefined) missing.push('km driven');
    if (!hasText(listing.registration_number) && !hasText(listing.rc_status)) missing.push('RC or registration');
    if (!hasText(listing.insurance_valid_until)) missing.push('insurance');
    return missing;
  }

  private async getListingSyncReadiness(db: any, businessId: string, itemId: string) {
    const rows = await db.$queryRawUnsafe(
      `SELECT
         ci.*,
         row_to_json(vid.*) AS vehicle,
         row_to_json(pid.*) AS property
       FROM catalog_items ci
       LEFT JOIN vehicle_item_details vid ON vid.item_id = ci.item_id
       LEFT JOIN property_item_details pid ON pid.item_id = ci.item_id
       WHERE ci.business_id = $1
         AND ci.item_id = $2
         AND ci.deleted_at IS NULL
       LIMIT 1`,
      businessId,
      itemId,
    ) as any[];
    const item = rows[0];
    if (!item) return { ready: false, missing: ['listing'] };

    const vertical = item.item_type === 'property' ? 'real_estate' : 'used_cars';
    const details = item.item_type === 'property' ? (item.property ?? {}) : (item.vehicle ?? {});
    const missing = this.buildListingReadiness({
      ...details,
      item_id: item.item_id,
      name: item.name,
      description: item.description,
      price: this.toNumber(item.base_price),
      primary_image_url: item.primary_image_url,
    }, vertical);

    return { ready: missing.length === 0, missing };
  }

  private toDateOnly(value?: string | null) {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  }

  private async generateVisitSlots(
    db: any,
    businessId: string,
    dateKey: string,
    dayOfWeek: number,
    durationMinutes: number,
    preferredStaffId?: string,
  ): Promise<SlotCandidate[]> {
    const rows = await db.$queryRawUnsafe(
      `SELECT
         s.sales_staff_id,
         s.name,
         s.phone,
         s.priority,
         a.start_time,
         a.end_time
       FROM appointment_sales_staff s
       JOIN appointment_sales_staff_availability a
         ON a.sales_staff_id = s.sales_staff_id
        AND a.business_id = s.business_id
        AND a.is_active = TRUE
       WHERE s.business_id = $1
         AND s.is_active = TRUE
         AND a.day_of_week = $2
         AND a.window_type = 'working'
         AND ($3::uuid IS NULL OR s.sales_staff_id = $3::uuid)
       ORDER BY s.priority ASC, s.created_at ASC, a.start_time ASC`,
      businessId,
      dayOfWeek,
      preferredStaffId ?? null,
    ) as any[];

    const dayStart = this.dateWithLocalTime(dateKey, '00:00');
    const dayEnd = this.dateWithLocalTime(dateKey, '23:59');
    const [existing, blocks] = await Promise.all([
      db.$queryRawUnsafe(
        `SELECT scheduled_start, COUNT(*)::int AS booked_count
         FROM appointment_sales_visits
         WHERE business_id = $1
           AND scheduled_start >= $2
           AND scheduled_start <= $3
           AND status IN ('scheduled', 'confirmed', 'arrived')
         GROUP BY scheduled_start`,
        businessId,
        dayStart,
        dayEnd,
      ) as Promise<any[]>,
      db.$queryRawUnsafe(
        `SELECT sales_staff_id, start_time, end_time
         FROM appointment_sales_staff_availability
         WHERE business_id = $1
           AND day_of_week = $2
           AND is_active = TRUE
           AND window_type IN ('lunch', 'break', 'blocked')`,
        businessId,
        dayOfWeek,
      ) as Promise<any[]>,
    ]);

    const slots: SlotCandidate[] = [];
    const stepMinutes = VISIT_START_INTERVAL_MINUTES;
    const now = new Date();

    for (const row of rows) {
      let cursor = this.dateWithLocalTime(dateKey, row.start_time);
      const windowEnd = this.dateWithLocalTime(dateKey, row.end_time);
      while (cursor.getTime() < windowEnd.getTime()) {
        const slotEnd = new Date(cursor.getTime() + durationMinutes * 60 * 1000);
        const isPast = cursor.getTime() <= now.getTime();
        const bookedCount = existing
          .filter((visit) =>
            new Date(visit.scheduled_start).getTime() === cursor.getTime()
          )
          .reduce((sum, visit) => sum + Number(visit.booked_count ?? 0), 0);
        const hasBlock = blocks.some((block) => {
          if (block.sales_staff_id !== row.sales_staff_id) return false;
          const blockStart = this.dateWithLocalTime(dateKey, block.start_time);
          const blockEnd = this.dateWithLocalTime(dateKey, block.end_time);
          return blockStart.getTime() <= cursor.getTime() && blockEnd.getTime() > cursor.getTime();
        });
        if (!isPast && bookedCount < MAX_VISITS_PER_REQUESTED_TIME && !hasBlock) {
          slots.push({
            staff_id: row.sales_staff_id,
            staff_name: row.name,
            staff_phone: row.phone,
            start: cursor,
            end: slotEnd,
            booked_count: bookedCount,
            available_count: MAX_VISITS_PER_REQUESTED_TIME - bookedCount,
            capacity: MAX_VISITS_PER_REQUESTED_TIME,
          });
        }
        cursor = new Date(cursor.getTime() + stepMinutes * 60 * 1000);
      }
    }

    return slots.sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  private async resolveVertical(user: AuthUser, override?: string) {
    if (override === 'used_cars' || override === 'real_estate') return override;
    if (user.business_type === 'used_cars' || user.business_type === 'real_estate') return user.business_type;

    const business = await this.prisma.businesses.findUnique({
      where: { business_id: user.business_id },
      select: { business_type: true },
    });
    return business?.business_type === 'real_estate' ? 'real_estate' : 'used_cars';
  }

  private async findOrCreateCustomer(db: any, businessId: string, tenantId: string, phone: string, name?: string) {
    const normalizedPhone = this.normalizePhone(phone);
    const existing = await db.customers.findFirst({
      where: {
        business_id: businessId,
        phone: normalizedPhone,
        deleted_at: null,
      },
    });
    if (existing) {
      if (name && !existing.name) {
        return db.customers.update({
          where: { customer_id: existing.customer_id },
          data: { name, updated_at: new Date() },
        });
      }
      return existing;
    }

    return db.customers.create({
      data: {
        business_id: businessId,
        tenant_id: tenantId,
        phone: normalizedPhone,
        whatsapp_number: normalizedPhone,
        name,
        engagement_score: 10,
      },
    });
  }

  private defaultAvailability(): AppointmentAvailabilityWindowDto[] {
    return [1, 2, 3, 4, 5, 6].map((day) => ({
      day_of_week: day,
      start_time: '10:00',
      end_time: '18:00',
      window_type: 'working',
      label: 'Working hours',
      is_active: true,
    }));
  }

  private assertTimeWindow(start: string, end: string) {
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
      throw new BadRequestException('Availability time must be HH:mm');
    }
    if (this.timeToMinutes(end) <= this.timeToMinutes(start)) {
      throw new BadRequestException('Availability end time must be after start time');
    }
  }

  private dateWithLocalTime(dateKey: string, time: string) {
    return new Date(`${dateKey}T${time}:00+05:30`);
  }

  private parseDateOnly(dateKey: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) throw new BadRequestException('Date must be YYYY-MM-DD');
    return this.dateWithLocalTime(dateKey, '00:00');
  }

  private startOfLocalDay(date: Date) {
    const dateKey = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
    return this.dateWithLocalTime(dateKey, '00:00');
  }

  private localTime(date: Date) {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  private slotLabel(date: Date) {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  private timeToMinutes(value: string) {
    const [hour, minute] = value.split(':').map(Number);
    return hour * 60 + minute;
  }

  private normalizePhone(phone: string) {
    return phone.trim().replace(/[^\d+]/g, '');
  }

  private requireTenant(user: AuthUser) {
    if (!user.tenant_id) throw new BadRequestException('Authenticated user is missing tenant_id');
    return user.tenant_id;
  }

  private toNumber(value: any) {
    if (value === null || value === undefined) return 0;
    return Number(value);
  }

  private async optionalQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      return await this.prisma.$queryRawUnsafe<T[]>(sql, ...params);
    } catch (error) {
      if (this.isMissingAppointmentSalesTable(error)) return [];
      throw error;
    }
  }

  private async requiredQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      return await this.prisma.$queryRawUnsafe<T[]>(sql, ...params);
    } catch (error) {
      return this.handleMutationError(error);
    }
  }

  private handleMutationError(error: any): never {
    if (this.isMissingAppointmentSalesTable(error)) {
      throw new BadRequestException(
        'Appointment sales tables are not available yet. Apply prisma/migrations/20260605_appointment_sales_business/migration.sql',
      );
    }
    if (String(error?.message ?? '').includes('appointment_visits_staff_no_overlap')) {
      throw new ConflictException('This visit time is full. Please ask the customer if the next hour is okay.');
    }
    throw error;
  }

  private isMissingAppointmentSalesTable(error: any): boolean {
    const text = [
      error?.code,
      error?.message,
      error?.meta?.message,
      error?.cause?.message,
    ].filter(Boolean).join(' ');
    return text.includes('42P01') || text.includes('does not exist');
  }
}
