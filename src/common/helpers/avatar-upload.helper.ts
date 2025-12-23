import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { Request } from 'express';

/**
 * Avatar storage configuration with automatic image compression
 */
export const avatarStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/avatars';
    
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
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

/**
 * Image file filter - only allow images
 */
export const imageFileFilter = (
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
 * Compress and resize uploaded avatar image
 * - Max width: 500px (maintains aspect ratio)
 * - Format: JPEG with 85% quality
 * - Removes EXIF data
 * 
 * @param filePath - Path to uploaded file
 * @returns Path to compressed file
 */
export async function compressAvatar(filePath: string): Promise<string> {
  try {
    const compressedPath = filePath.replace(
      extname(filePath),
      '-compressed.jpg',
    );

    await sharp(filePath)
      .resize(500, 500, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 85,
        progressive: true,
      })
      .toFile(compressedPath);

    // Delete original file after compression
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    return compressedPath;
  } catch (error) {
    console.error('Error compressing avatar:', error);
    throw new BadRequestException('Failed to process avatar image');
  }
}

/**
 * Delete avatar file from disk
 *
 * @param avatarPath - Relative path to avatar (e.g., "avatars/filename.jpg")
 */
export function deleteAvatar(avatarPath: string): void {
  try {
    // Extract filename from path
    const filename = avatarPath.includes('/') 
      ? avatarPath.split('/').pop() 
      : avatarPath;
    
    if (filename) {
      const filePath = `./uploads/avatars/${filename}`;
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        console.log(`Deleted avatar: ${filename}`);
      }
    }
  } catch (error) {
    console.error('Error deleting avatar:', error);
  }
}

/**
 * Extract filename from avatar URL
 * 
 * @param avatarUrl - Full URL to avatar
 * @returns Filename only
 */
export function extractAvatarFilename(avatarUrl: string): string | null {
  try {
    const parts = avatarUrl.split('/avatars/');
    return parts.length > 1 ? parts[1] : null;
  } catch {
    return null;
  }
}
