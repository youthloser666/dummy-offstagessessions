import { v2 as cloudinary } from 'cloudinary';

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary, isCloudinaryConfigured };

/**
 * Generate signed upload parameters for client-side direct uploads.
 * This allows the browser to upload directly to Cloudinary without exposing the API secret.
 */
export function generateUploadSignature(folder: string = 'offstage-sessions') {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured in environment variables.');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder,
  };
}

/**
 * Upload a Base64 or Data URI string directly from server-side.
 */
export async function uploadMedia(fileData: string, folder: string = 'offstage-sessions') {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured.');
  }

  const result = await cloudinary.uploader.upload(fileData, {
    folder,
    resource_type: 'auto',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    format: result.format,
    width: result.width,
    height: result.height,
  };
}
