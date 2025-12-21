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
 * Generate file URL from filename
 */
export const generateFileUrl = (req: any, filename: string): string => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/logos/${filename}`;
};

/**
 * Delete file from filesystem
 */
export const deleteFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error deleting file: ${filePath}`, error);
  }
};

/**
 * Extract filename from URL
 */
export const extractFilenameFromUrl = (url: string): string | null => {
  try {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  } catch (error) {
    return null;
  }
};
