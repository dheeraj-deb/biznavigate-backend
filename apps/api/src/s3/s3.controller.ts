import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('s3')
@UseGuards(JwtAuthGuard)
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  /**
   * Upload single file
   * POST /s3/upload
   */
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.s3Service.uploadFile(file, folder || 'uploads');

    return {
      success: true,
      message: 'File uploaded successfully',
      data: result,
    };
  }

  /**
   * Upload multiple files
   * POST /s3/upload-multiple
   */
  @Post('upload-multiple')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const results = await this.s3Service.uploadFiles(files, folder || 'uploads');

    return {
      success: true,
      message: `${results.length} files uploaded successfully`,
      data: results,
    };
  }

  /**
   * Upload base64 image
   * POST /s3/upload-base64
   */
  @Post('upload-base64')
  @HttpCode(HttpStatus.OK)
  async uploadBase64Image(
    @Body('image') image: string,
    @Body('folder') folder?: string,
  ) {
    if (!image) {
      throw new BadRequestException('No image data provided');
    }

    const result = await this.s3Service.uploadBase64Image(image, folder || 'products');

    return {
      success: true,
      message: 'Image uploaded successfully',
      data: result,
    };
  }

  /**
   * Upload multiple base64 images
   * POST /s3/upload-base64-multiple
   */
  @Post('upload-base64-multiple')
  @HttpCode(HttpStatus.OK)
  async uploadBase64Images(
    @Body('images') images: string[],
    @Body('folder') folder?: string,
  ) {
    if (!images || images.length === 0) {
      throw new BadRequestException('No images provided');
    }

    const results = await this.s3Service.uploadBase64Images(images, folder || 'products');

    return {
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results,
    };
  }

  /**
   * Delete file
   * DELETE /s3/:key
   */
  @Delete(':key')
  @HttpCode(HttpStatus.OK)
  async deleteFile(@Param('key') key: string) {
    await this.s3Service.deleteFile(key);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }

  /**
   * Get signed URL
   * POST /s3/signed-url
   */
  @Post('signed-url')
  @HttpCode(HttpStatus.OK)
  async getSignedUrl(
    @Body('key') key: string,
    @Body('expiresIn') expiresIn?: number,
  ) {
    if (!key) {
      throw new BadRequestException('File key is required');
    }

    const signedUrl = await this.s3Service.getSignedUrl(key, expiresIn);

    return {
      success: true,
      message: 'Signed URL generated successfully',
      data: { url: signedUrl },
    };
  }
}
