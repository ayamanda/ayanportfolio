
import { ImageResponse } from 'next/og';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { NextRequest } from 'next/server';
import { Profile } from '@/types';

async function getEmbeddedPhotoSrc(photoURL: string | undefined) {
  if (!photoURL || !photoURL.startsWith('http')) {
    return null;
  }

  try {
    const response = await fetch(photoURL);

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.startsWith('image/')) {
      return null;
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer()).toString('base64');
    return `data:${contentType};base64,${imageBuffer}`;
  } catch (error) {
    console.error('Failed to embed OG profile image:', error);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const profileSnapshot = await getDocs(collection(db, 'profile'));
    const profile = profileSnapshot.empty ? null : profileSnapshot.docs[0].data() as Profile;
    const photoURL = await getEmbeddedPhotoSrc(profile?.photoURL);
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: '#0f172a',
          }}
        >
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              width="300"
              height="300"
              style={{
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                border: '4px solid rgba(255, 255, 255, 0.2)',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: '#1e293b',
                border: '4px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    // Return a default image response instead of an error
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: '#0f172a',
          }}
        >
          <div
            style={{
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: '#1e293b',
              border: '4px solid rgba(255, 255, 255, 0.2)',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
