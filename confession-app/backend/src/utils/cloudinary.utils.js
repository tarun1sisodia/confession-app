import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import AppError from './AppError.js';

dotenv.config();

const hasCloudinaryConfig =
  !!process.env.CLOUDINARY_URL ||
  (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

if (hasCloudinaryConfig) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config(process.env.CLOUDINARY_URL);
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
  }
}

export const uploadToCloudinary = async (filePath) => {
  if (!hasCloudinaryConfig) {
    throw new AppError('Image upload is not configured on the server', 503);
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'confessions',
      resource_type: 'image'
    });
    return result.secure_url;
  } catch (error) {
    throw new AppError(`Image upload failed: ${error.message}`, 502);
  }
};
