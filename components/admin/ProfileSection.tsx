import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { Profile } from '../../types';
import { toast } from 'react-toastify';

export const ProfileSection: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { register, handleSubmit, setValue, watch } = useForm<Profile>();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const photoURL = watch('photoURL');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'profile', 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const profileData = docSnap.data() as Profile;
        setProfile(profileData);
        Object.entries(profileData).forEach(([key, value]) => {
          setValue(key as keyof Profile, value);
        });
      }
    } catch (error) {
      toast.error('Failed to fetch profile. Please try again.');
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Profile) => {
    try {
      const profileData = {
        name: data.name,
        title: data.title,
        about: data.about,
        photoURL: data.photoURL
      };
      await setDoc(doc(db, 'profile', 'main'), profileData, { merge: true });
      setProfile(profileData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Profile update failed:', error);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const storageRef = ref(storage, `profile/${file.name}`);

    try {
      setUploading(true);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setValue('photoURL', downloadURL);
      toast.success('Profile photo uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload profile photo. Please try again.');
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('name')} placeholder="Name" className="w-full p-2 bg-gray-700 rounded" />
        <input {...register('title')} placeholder="Title" className="w-full p-2 bg-gray-700 rounded" />
        <textarea {...register('about')} placeholder="About" className="w-full p-2 bg-gray-700 rounded" rows={4} />
        <div {...getRootProps()} className="border-2 border-dashed border-gray-600 p-4 rounded text-center cursor-pointer">
          <input {...getInputProps()} />
          <p>Drag & drop profile photo or click to select</p>
        </div>
        
        {photoURL && (
          <img src={photoURL} alt="Profile" className="w-32 h-32 rounded-full mx-auto object-cover" />
        )}
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};