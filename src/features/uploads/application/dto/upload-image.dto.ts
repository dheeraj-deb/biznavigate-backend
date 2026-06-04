import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID } from 'class-validator';

export class UploadImageDto {
  @IsUUID()
  @IsString()
  business_id: string;

  @IsUUID()
  @IsString()
  product_id: string;

  @IsString()
  @IsOptional()
  alt_text?: string;

  @IsNumber()
  @IsOptional()
  display_order?: number;

  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;
}

export class UpdateImageDto {
  @IsString()
  @IsOptional()
  alt_text?: string;

  @IsNumber()
  @IsOptional()
  display_order?: number;

  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;
}

export class ImageResponseDto {
  image_id: string;
  product_id: string;
  file_name: string;
  file_path: string;
  file_url: string; // Full URL to access the image
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  storage_type: string;
  created_at: Date;
  updated_at: Date;
}
