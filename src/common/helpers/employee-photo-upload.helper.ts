import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

/**
 * Employee photo storage configuration with automatic image compression
 */
export const employeePhotoStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/employees';
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname);
    cb(null, `employee-${uniqueSuffix}${ext}`);
  },
});

/**
 * Image file filter - only allow images
 */
export const employeePhotoFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return callback(
      new BadRequestException('Only image files are allowed! (jpg, jpeg, png, gif, webp)'),
      false,
    );
  }
  callback(null, true);
};

/**
 * Compress and convert employee photo to WebP
 * - Max dimensions: 800x800px (maintains aspect ratio)
 * - Format: WebP with 85% quality
 * - Removes EXIF data
 * - Smaller file size than JPEG
 * 
 * @param filePath - Path to uploaded file
 * @returns Path to compressed WebP file
 */
export async function compressEmployeePhoto(filePath: string): Promise<string> {
  try {
    // Convert to .webp extension
    const compressedPath = filePath.replace(
      extname(filePath),
      '.webp',
    );

    await sharp(filePath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,
      })
      .toFile(compressedPath);

    // Delete original file after compression
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    return compressedPath;
  } catch (error) {
    console.error('Error compressing employee photo:', error);
    throw new BadRequestException('Failed to process employee photo');
  }
}

/**
 * Delete employee photo file from disk
 *
 * @param photoPath - Relative path to photo (e.g., "/uploads/employees/filename.webp")
 */
export function deleteEmployeePhoto(photoPath: string): void {
  try {
    // Extract filename from path
    const filename = photoPath.includes('/') 
      ? photoPath.split('/').pop() 
      : photoPath;
    
    if (filename) {
      const filePath = `./uploads/employees/${filename}`;
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        console.log(`Deleted employee photo: ${filePath}`);
      }
    }
  } catch (error) {
    console.error('Error deleting employee photo:', error);
    // Don't throw error - deletion is not critical
  }
}
