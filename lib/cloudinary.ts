import crypto from 'node:crypto';

const ALLOWED_FOLDERS = new Set(['profile', 'projects']);

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export type CloudinaryFolder = 'profile' | 'projects';

export type CloudinaryAsset = {
  publicId: string;
  url: string;
  createdAt?: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
};

export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    );
  }

  return { cloudName, apiKey, apiSecret };
}

export function getValidatedFolder(folder: string | null | undefined): CloudinaryFolder {
  if (!folder || !ALLOWED_FOLDERS.has(folder)) {
    throw new Error('Invalid Cloudinary folder.');
  }

  return folder as CloudinaryFolder;
}

export function isAllowedPublicId(publicId: string): boolean {
  return Array.from(ALLOWED_FOLDERS).some((folder) => publicId.startsWith(`${folder}/`));
}

export function signCloudinaryParams(
  params: Record<string, string | number | boolean | undefined>,
  apiSecret: string
): string {
  const paramString = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return crypto.createHash('sha1').update(`${paramString}${apiSecret}`).digest('hex');
}

