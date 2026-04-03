import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env.js';
import AppError from './AppError.js';

const hasCloudinaryConfig =
  !!env.CLOUDINARY_URL ||
  (
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET
  );

if (hasCloudinaryConfig) {
  if (env.CLOUDINARY_URL) {
    cloudinary.config(env.CLOUDINARY_URL);
  } else {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET
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
