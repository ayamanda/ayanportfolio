import { NextRequest, NextResponse } from 'next/server';
import {
  getCloudinaryConfig,
  getValidatedFolder,
  isAllowedPublicId,
  signCloudinaryParams,
} from '@/lib/cloudinary';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const folder = getValidatedFolder(request.nextUrl.searchParams.get('folder'));
    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const endpoint = new URL(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`);

    endpoint.searchParams.set('prefix', `${folder}/`);
    endpoint.searchParams.set('max_results', '100');

    const authHeader = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
      cache: 'no-store',
    });

    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.error?.message || payload?.error || 'Cloudinary list request failed.';
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const resources = (payload.resources || []).map((resource: any) => ({
      publicId: resource.public_id,
      url: resource.secure_url,
      createdAt: resource.created_at,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      format: resource.format,
    }));

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Cloudinary list failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected list error.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const publicId = body?.publicId;

    if (typeof publicId !== 'string' || !publicId.trim()) {
      return NextResponse.json({ error: 'A publicId is required.' }, { status: 400 });
    }

    if (!isAllowedPublicId(publicId)) {
      return NextResponse.json({ error: 'Invalid asset path.' }, { status: 400 });
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
      invalidate: 'true',
      public_id: publicId,
      timestamp,
    };

    const signature = signCloudinaryParams(paramsToSign, apiSecret);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        api_key: apiKey,
        invalidate: 'true',
        public_id: publicId,
        signature,
        timestamp: String(timestamp),
      }).toString(),
      cache: 'no-store',
    });

    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.error?.message || payload?.error || 'Cloudinary delete request failed.';
      return NextResponse.json({ error: message }, { status: response.status });
    }

    if (!['ok', 'not found'].includes(payload.result)) {
      return NextResponse.json({ error: 'Cloudinary delete was not successful.' }, { status: 500 });
    }

    return NextResponse.json({ result: payload.result });
  } catch (error) {
    console.error('Cloudinary delete failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected delete error.',
      },
      { status: 500 }
    );
  }
}
