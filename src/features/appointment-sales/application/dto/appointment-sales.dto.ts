import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class AppointmentAvailabilityWindowDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  day_of_week: number;

  @IsString()
  start_time: string;

  @IsString()
  end_time: string;

  @IsString()
  @IsOptional()
  @IsIn(['working', 'lunch', 'break', 'blocked'])
  window_type?: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class AppointmentSalesStaffDto {
  @IsUUID()
  @IsOptional()
  sales_staff_id?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppointmentAvailabilityWindowDto)
  @IsOptional()
  availability?: AppointmentAvailabilityWindowDto[];
}

export class AppointmentSalesListingDto {
  @IsUUID()
  @IsOptional()
  item_id?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  primary_image_url?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  image_urls?: string[];

  @IsString()
  @IsOptional()
  @IsIn(['available', 'reserved', 'sold', 'inactive'])
  status?: string;

  @IsString()
  @IsOptional()
  make?: string;

  @IsString()
  @IsOptional()
  model_name?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  fuel_type?: string;

  @IsString()
  @IsOptional()
  transmission?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  km_driven?: number;

  @IsString()
  @IsOptional()
  condition?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  ownership_count?: number;

  @IsString()
  @IsOptional()
  insurance_valid_until?: string;

  @IsString()
  @IsOptional()
  registration_number?: string;

  @IsString()
  @IsOptional()
  rc_status?: string;

  @IsBoolean()
  @IsOptional()
  finance_available?: boolean;

  @IsBoolean()
  @IsOptional()
  exchange_accepted?: boolean;

  @IsString()
  @IsOptional()
  accident_history?: string;

  @IsString()
  @IsOptional()
  service_history?: string;

  @IsBoolean()
  @IsOptional()
  test_drive_available?: boolean;

  @IsString()
  @IsOptional()
  property_type?: string;

  @IsString()
  @IsOptional()
  @IsIn(['sale', 'rent', 'lease'])
  listing_type?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  bedrooms?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  bathrooms?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  area_sqft?: number;

  @IsString()
  @IsOptional()
  locality?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  furnishing?: string;

  @IsString()
  @IsOptional()
  possession_status?: string;

  @IsString()
  @IsOptional()
  rera_id?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  floor_number?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  total_floors?: number;

  @IsString()
  @IsOptional()
  facing?: string;

  @IsString()
  @IsOptional()
  parking?: string;

  @IsString()
  @IsOptional()
  map_url?: string;

  @IsString()
  @IsOptional()
  documents_status?: string;

  @IsBoolean()
  @IsOptional()
  loan_support_available?: boolean;

  @IsString()
  @IsOptional()
  visit_landmark?: string;
}

export class UpdateAppointmentListingStatusDto {
  @IsString()
  @IsIn(['available', 'reserved', 'sold', 'inactive'])
  status: string;
}

export class CompleteAppointmentSalesSetupDto {
  @IsString()
  @IsOptional()
  @IsIn(['used_cars', 'real_estate'])
  vertical_type?: string;

  @IsString()
  @IsOptional()
  default_visit_type?: string;

  @IsString()
  @IsOptional()
  default_visit_location?: string;

  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(240)
  @IsOptional()
  slot_duration_minutes?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(120)
  @IsOptional()
  visit_buffer_minutes?: number;

  @IsBoolean()
  @IsOptional()
  auto_assign_visits?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1440)
  @IsOptional()
  reminder_minutes_before?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppointmentSalesStaffDto)
  @IsOptional()
  staff?: AppointmentSalesStaffDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppointmentSalesListingDto)
  @IsOptional()
  listings?: AppointmentSalesListingDto[];
}

export class AppointmentSalesSlotsQueryDto {
  @IsString()
  date: string;

  @IsUUID()
  @IsOptional()
  item_id?: string;

  @IsUUID()
  @IsOptional()
  sales_staff_id?: string;

  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(240)
  @IsOptional()
  duration_minutes?: number;
}

export class AppointmentSalesVisitsQueryDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  from_date?: string;

  @IsString()
  @IsOptional()
  to_date?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}

export class CreateAppointmentVisitDto {
  @IsUUID()
  @IsOptional()
  item_id?: string;

  @IsUUID()
  @IsOptional()
  sales_staff_id?: string;

  @IsUUID()
  @IsOptional()
  lead_id?: string;

  @IsUUID()
  @IsOptional()
  customer_id?: string;

  @IsString()
  @IsOptional()
  customer_name?: string;

  @IsString()
  @IsOptional()
  customer_phone?: string;

  @IsString()
  @IsOptional()
  visit_type?: string;

  @IsString()
  scheduled_start: string;

  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(240)
  @IsOptional()
  duration_minutes?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAppointmentVisitStatusDto {
  @IsString()
  @IsIn(['scheduled', 'confirmed', 'arrived', 'completed', 'converted', 'lost', 'cancelled', 'no_show'])
  status: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class AssignAppointmentVisitDto {
  @IsUUID()
  @IsOptional()
  sales_staff_id?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
