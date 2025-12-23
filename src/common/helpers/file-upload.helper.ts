import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

// Allowed image mime types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

// Max file size: 1MB
export const MAX_FILE_SIZE = 1048576; // 1MB in bytes

// Upload directory
export const UPLOAD_DIR = './uploads/logos';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Multer storage configuration for logo uploads
 */
export const logoStorage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter for image validation
 */
export const imageFileFilter = (req: any, file: Express.Multer.File, callback: any) => {
  // Check mime type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        `Invalid file type. Only JPEG and PNG images are allowed. Received: ${file.mimetype}`,
      ),
      false,
    );
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return callback(
      new BadRequestException(
        `File size exceeds maximum allowed size of 1MB. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      ),
      false,
    );
  }

  callback(null, true);
};

/**
 * Delete file from filesystem using relative path
 * @param logoPath - Relative path like "logos/logo-123456.jpg" or just "logo-123456.jpg"
 */
export const deleteFile = (logoPath: string): void => {
  try {
    // Extract filename from path
    const filename = logoPath.includes('/') 
      ? logoPath.split('/').pop() 
      : logoPath;
    
    if (!filename) return;

    const fullPath = `${UPLOAD_DIR}/${filename}`;
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error(`Error deleting file: ${logoPath}`, error);
  }
};

