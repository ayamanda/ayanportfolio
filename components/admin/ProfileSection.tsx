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
import { Loader2, Linkedin, Twitter, Instagram, Github, Mail } from "lucide-react"

// Custom Upwork icon component
const UpworkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
    className="text-current"
  >
    <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/>
  </svg>
);

// Define the Profile type
interface Profile {
  name: string;
  title: string;
  about: string;
  photoURL: string;
  linkedinURL?: string;
  twitterURL?: string;
  instagramURL?: string;
  githubURL?: string;
  upworkURL?: string;
  email?: string;
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
      // Format URLs if they don't start with http:// or https://
      const formatURL = (url: string | undefined) => {
        if (!url) return url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return `https://${url}`;
        }
        return url;
      };

      const formattedData = {
        ...data,
        linkedinURL: formatURL(data.linkedinURL),
        twitterURL: formatURL(data.twitterURL),
        instagramURL: formatURL(data.instagramURL),
        githubURL: formatURL(data.githubURL),
        upworkURL: formatURL(data.upworkURL),
      };

      const docRef = doc(db, 'profile', 'main');
      const updateData: Partial<Profile> = {};
      (Object.keys(formattedData) as Array<keyof Profile>).forEach(key => {
        if (formattedData[key] !== undefined && formattedData[key] !== null) {
          updateData[key] = formattedData[key];
        }
      });
      await updateDoc(docRef, updateData as DocumentData);
      setProfile(formattedData);
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedinURL" className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn URL
                  </Label>
                  <Input 
                    id="linkedinURL" 
                    {...register('linkedinURL')} 
                    placeholder="linkedin.com/in/yourprofile"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="githubURL" className="flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub URL
                  </Label>
                  <Input 
                    id="githubURL" 
                    {...register('githubURL')} 
                    placeholder="github.com/yourusername"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upworkURL" className="flex items-center gap-2">
                    <UpworkIcon />
                    Upwork URL
                  </Label>
                  <Input 
                    id="upworkURL" 
                    {...register('upworkURL')} 
                    placeholder="upwork.com/freelancers/~yourid"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterURL" className="flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter URL
                  </Label>
                  <Input 
                    id="twitterURL" 
                    {...register('twitterURL')} 
                    placeholder="twitter.com/yourhandle"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagramURL" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram URL
                  </Label>
                  <Input 
                    id="instagramURL" 
                    {...register('instagramURL')} 
                    placeholder="instagram.com/yourhandle"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...register('email')} 
                    placeholder="you@example.com" 
                  />
                </div>
              </div>
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