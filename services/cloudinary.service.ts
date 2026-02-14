import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/config/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

export class CloudinaryService {
  /**
   * Upload a file to Cloudinary
   * @param fileBuffer - Buffer or base64 string of the file
   * @param fileName - Original filename (used for public_id)
   * @param folder - Cloudinary folder path (default: 'memo')
   * @returns Cloudinary upload result with secure_url
   */
  static async uploadFile(
    fileBuffer: Buffer | string,
    fileName: string,
    folder: string = 'memo'
  ): Promise<string> {
    try {
      // Validate inputs
      if (!fileBuffer) {
        throw new Error('File buffer is required');
      }

      if (!fileName) {
        throw new Error('File name is required');
      }

      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
      }

      // Convert buffer to base64 if needed
      const base64String = Buffer.isBuffer(fileBuffer)
        ? `data:image/jpeg;base64,${fileBuffer.toString('base64')}`
        : fileBuffer;

      // Clean filename for public_id
      const cleanFileName = fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/\.[^/.]+$/, ''); // Remove extension

      const timestamp = Date.now();
      const publicId = `${folder}/${timestamp}_${cleanFileName}`;

      // Upload to Cloudinary with optimizations
      const result = await cloudinary.uploader.upload(base64String, {
        public_id: publicId,
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        overwrite: false
      }) as CloudinaryUploadResult;

      console.log(`Successfully uploaded to Cloudinary: ${result.secure_url}`);
      return result.secure_url;

    } catch (error: unknown) {
      const err = error as { message?: string; http_code?: number };
      console.error('Cloudinary upload failed:', {
        message: err.message,
        code: err.http_code
      });

      // Handle specific error types
      if (err.http_code === 401) {
        throw new Error('Cloudinary authentication failed - check your API credentials');
      }
      if (err.http_code === 403) {
        throw new Error('Cloudinary permission denied - check your API key permissions');
      }
      if (err.http_code === 420) {
        throw new Error('Rate limited by Cloudinary. Please wait and try again.');
      }

      throw new Error(`Cloudinary upload failed: ${err.message || 'unknown error'}`);
    }
  }

  /**
   * Delete a file from Cloudinary
   * @param publicId - The public_id of the resource to delete
   * @returns true if deleted, false otherwise
   */
  static async deleteFile(publicId: string): Promise<boolean> {
    try {
      if (!publicId) {
        throw new Error('Public ID is required');
      }

      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        console.log(`Successfully deleted from Cloudinary: ${publicId}`);
        return true;
      }

      if (result.result === 'not found') {
        console.log(`File not found in Cloudinary: ${publicId}`);
        return false;
      }

      return false;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('Cloudinary delete failed:', err.message);
      return false;
    }
  }

  /**
   * Get optimized image URL with transformations
   * @param publicId - The public_id of the image
   * @param width - Desired width
   * @param height - Desired height
   * @param crop - Crop mode (default: 'fill')
   * @returns Transformed image URL
   */
  static getOptimizedUrl(
    publicId: string,
    width?: number,
    height?: number,
    crop: string = 'fill'
  ): string {
    return cloudinary.url(publicId, {
      transformation: [
        { width, height, crop, quality: 'auto:good' },
        { fetch_format: 'auto' }
      ],
      secure: true
    });
  }

  /**
   * Check Cloudinary connection health
   */
  static async checkHealth(): Promise<{
    ok: boolean;
    message: string;
    cloudName?: string;
  }> {
    try {
      // Test by getting account usage
      const result = await cloudinary.api.usage();
      
      return {
        ok: true,
        message: 'Cloudinary connection successful: ' + result,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME
      };
    } catch (error: unknown) {
      const err = error as { message?: string; http_code?: number };
      return {
        ok: false,
        message: `Cloudinary connection failed: ${err.message}`,
      };
    }
  }

  /**
   * Extract public_id from Cloudinary URL
   * @param url - Cloudinary URL
   * @returns public_id or null
   */
  static extractPublicId(url: string): string | null {
    try {
      // Example URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/file.jpg
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
