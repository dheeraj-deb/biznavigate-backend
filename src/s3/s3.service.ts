import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string }> {
    try {
      // Generate unique file name
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // Construct public URL
      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;

      this.logger.log(`File uploaded successfully: ${fileName}`);

      return {
        url,
        key: fileName,
      };
    } catch (error) {
      this.logger.error('Failed to upload file to S3:', error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  /**
   * Upload multiple files to S3
   */
  async uploadFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
  ): Promise<Array<{ url: string; key: string }>> {
    try {
      const uploadPromises = files.map((file) => this.uploadFile(file, folder));
      return await Promise.all(uploadPromises);
    } catch (error) {
      this.logger.error('Failed to upload files to S3:', error);
      throw new BadRequestException('Failed to upload files');
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error('Failed to delete file from S3:', error);
      throw new BadRequestException('Failed to delete file');
    }
  }

  /**
   * Delete multiple files from S3
   */
  async deleteFiles(keys: string[]): Promise<void> {
    try {
      const deletePromises = keys.map((key) => this.deleteFile(key));
      await Promise.all(deletePromises);
    } catch (error) {
      this.logger.error('Failed to delete files from S3:', error);
      throw new BadRequestException('Failed to delete files');
    }
  }

  /**
   * Get a signed URL for temporary file access
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      this.logger.error('Failed to generate signed URL:', error);
      throw new BadRequestException('Failed to generate signed URL');
    }
  }

  /**
   * Upload base64 image to S3
   */
  async uploadBase64Image(
    base64Data: string,
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string }> {
    try {
      // Extract mime type and base64 string
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      if (!matches || matches.length !== 3) {
        throw new BadRequestException('Invalid base64 image data');
      }

      const mimeType = matches[1];
      const base64String = matches[2];
      const buffer = Buffer.from(base64String, 'base64');

      // Determine file extension from mime type
      const extension = mimeType.split('/')[1];
      const fileName = `${folder}/${uuidv4()}.${extension}`;

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: mimeType,
      });

      await this.s3Client.send(command);

      // Construct public URL
      const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;

      this.logger.log(`Base64 image uploaded successfully: ${fileName}`);

      return {
        url,
        key: fileName,
      };
    } catch (error) {
      this.logger.error('Failed to upload base64 image to S3:', error);
      this.logger.error('Error details:', error.message);
      this.logger.error('Error stack:', error.stack);
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Upload multiple base64 images to S3
   */
  async uploadBase64Images(
    base64Images: string[],
    folder: string = 'uploads',
  ): Promise<Array<{ url: string; key: string }>> {
    try {
      const uploadPromises = base64Images.map((image) =>
        this.uploadBase64Image(image, folder),
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      this.logger.error('Failed to upload base64 images to S3:', error);
      throw new BadRequestException('Failed to upload images');
    }
  }
}
