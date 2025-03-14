import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/firebase';
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { PhotoGallery } from './PhotoGallery';
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

// Define the Profile type
interface Profile {
  name: string;
  title: string;
  about: string;
  photoURL: string;
  linkedinURL?: string;
  twitterURL?: string;
  instagramURL?: string;
  githubURL?: string;  // Add this line
  email?: string;      // Add this line
}

export const ProfileSection: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { register, handleSubmit, setValue, watch } = useForm<Profile>();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to fetch profile. Please try again.",
        variant: "destructive",
      });
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Profile) => {
    setUpdating(true);
    try {
      const docRef = doc(db, 'profile', 'main');
      const updateData: Partial<Profile> = {};
      (Object.keys(data) as Array<keyof Profile>).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          updateData[key] = data[key];
        }
      });
      await updateDoc(docRef, updateData as DocumentData);
      setProfile(data);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error('Profile update failed:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handlePhotoSelect = async (url: string) => {
    try {
      const docRef = doc(db, 'profile', 'main');
      await updateDoc(docRef, { photoURL: url });
      setValue('photoURL', url);
      setProfile(prev => prev ? { ...prev, photoURL: url } : null);
      toast({
        title: "Success",
        description: "Profile photo updated successfully!",
      });
    } catch (error) {
      console.error('Failed to update profile photo:', error);
      toast({
        title: "Error",
        description: "Failed to update profile photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div 
              className="flex flex-col items-center space-y-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar className="w-32 h-32">
                <AvatarImage src={photoURL} alt="Profile" />
                <AvatarFallback>{profile?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <PhotoGallery onPhotoSelect={handlePhotoSelect} currentPhotoURL={photoURL || ''} />
            </motion.div>
            
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
              <Label htmlFor="about">About</Label>
              <Textarea id="about" {...register('about')} placeholder="Tell us about yourself" rows={4} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="linkedinURL">LinkedIn URL</Label>
              <Input id="linkedinURL" {...register('linkedinURL')} placeholder="https://www.linkedin.com/in/yourprofile" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twitterURL">Twitter URL</Label>
              <Input id="twitterURL" {...register('twitterURL')} placeholder="https://twitter.com/yourhandle" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instagramURL">Instagram URL</Label>
              <Input id="instagramURL" {...register('instagramURL')} placeholder="https://www.instagram.com/yourhandle" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="githubURL">GitHub URL</Label>
              <Input id="githubURL" {...register('githubURL')} placeholder="https://github.com/yourusername" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                {...register('email')} 
                placeholder="you@example.com" 
              />
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button type="submit" className="w-full" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};