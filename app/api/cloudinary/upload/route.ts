import { NextRequest, NextResponse } from 'next/server';
import { getCloudinaryConfig, getValidatedFolder, signCloudinaryParams } from '@/lib/cloudinary';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = getValidatedFolder(formData.get('folder')?.toString());

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'A file is required.' }, { status: 400 });
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
      folder,
      timestamp,
      unique_filename: 'true',
      use_filename: 'true',
    };

    const signature = signCloudinaryParams(paramsToSign, apiSecret);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('folder', folder);
    uploadFormData.append('signature', signature);
    uploadFormData.append('timestamp', String(timestamp));
    uploadFormData.append('unique_filename', 'true');
    uploadFormData.append('use_filename', 'true');

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadFormData,
      cache: 'no-store',
    });

    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.error?.message || payload?.error || 'Cloudinary upload request failed.';
      return NextResponse.json({ error: message }, { status: response.status });
    }

    return NextResponse.json({
      publicId: payload.public_id,
      url: payload.secure_url,
      createdAt: payload.created_at,
      width: payload.width,
      height: payload.height,
      bytes: payload.bytes,
      format: payload.format,
    });
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected upload error.',
      },
      { status: 500 }
    );
  }
}

