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

async function getErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const payload = await response.json();
    return payload.error || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function uploadAsset(file: File, folder: CloudinaryFolder): Promise<CloudinaryAsset> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/cloudinary/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Upload failed.'));
  }

  return response.json();
}

export async function listAssets(folder: CloudinaryFolder): Promise<CloudinaryAsset[]> {
  const response = await fetch(`/api/cloudinary/resources?folder=${folder}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to load assets.'));
  }

  const payload = await response.json();
  return payload.resources;
}

export async function deleteAsset(publicId: string): Promise<void> {
  const response = await fetch('/api/cloudinary/resources', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to delete asset.'));
  }
}

