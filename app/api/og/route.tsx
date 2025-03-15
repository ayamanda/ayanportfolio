// app/api/og/route.tsx
import { ImageResponse } from 'next/og';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { NextRequest } from 'next/server';
import { Profile } from '@/types';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const profileSnapshot = await getDocs(collection(db, 'profile'));
    let profile: Profile | null = null;
    if (!profileSnapshot.empty) {
      profile = profileSnapshot.docs[0].data() as Profile;
    } else {
      throw new Error('No profile document found in Firestore');
    }

    const photoURL = profile?.photoURL || '/default-avatar.png';
    
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
          }}
        >
          {/* Profile Photo with elegant shadow */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 80px rgba(99, 102, 241, 0.3)',
              borderRadius: '50%',
            }}
          >
            <img
              src={photoURL}
              alt="Profile"
              style={{
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                border: '8px solid rgba(255, 255, 255, 0.1)',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Subtle grid background */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundSize: '40px 40px',
              backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
              opacity: 0.2,
              zIndex: -1,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}