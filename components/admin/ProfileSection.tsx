import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase';
import { Profile } from '../../types';
import { toast } from 'react-toastify';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { PhotoGallery } from './PhotoGallery';

export const ProfileSection: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { register, handleSubmit, setValue, watch } = useForm<Profile>();
  const [loading, setLoading] = useState(true);

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
      const docRef = doc(db, 'profile', 'main');
      const updateData: DocumentData = {};
      (Object.keys(data) as Array<keyof Profile>).forEach(key => {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      });
      await updateDoc(docRef, updateData);
      setProfile(data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
      console.error('Profile update failed:', error);
    }
  };

  const handlePhotoSelect = async (url: string) => {
    try {
      const docRef = doc(db, 'profile', 'main');
      await updateDoc(docRef, { photoURL: url });
      setValue('photoURL', url);
      toast.success('Profile photo updated!');
    } catch (error) {
      console.error('Failed to update profile photo:', error);
      toast.error('Failed to update profile photo. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-32 h-32">
              <AvatarImage src={photoURL} alt="Profile" />
              <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <PhotoGallery onPhotoSelect={handlePhotoSelect} currentPhotoURL={photoURL || ''} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} placeholder="Your Name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} placeholder="Your Professional Title" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" {...register('tagline')} placeholder="Your Catchy Tagline" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="about">About</Label>
            <Textarea id="about" {...register('about')} placeholder="Tell us about yourself" rows={4} />
          </div>
          
          <Button type="submit" className="w-full">
            Update Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};