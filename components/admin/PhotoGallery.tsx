import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Upload, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { storage } from '@/firebase';
import { toast } from 'react-toastify';

interface PhotoGalleryProps {
  onPhotoSelect: (url: string) => void;
  currentPhotoURL: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ onPhotoSelect, currentPhotoURL }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPhotos();
    }
  }, [isOpen]);

  const fetchPhotos = async () => {
    try {
      const listRef = ref(storage, 'profile');
      const res = await listAll(listRef);
      const urlPromises = res.items.map(itemRef => getDownloadURL(itemRef));
      const urls = await Promise.all(urlPromises);
      setPhotos(urls);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
      toast.error('Failed to load photos. Please try again.');
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const storageRef = ref(storage, `profile/${file.name}`);

    try {
      setUploading(true);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setPhotos(prev => [...prev, downloadURL]);
      toast.success('Photo uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload photo. Please try again.');
      console.error('File upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handlePhotoDelete = async (url: string) => {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
      setPhotos(prev => prev.filter(photo => photo !== url));
      toast.success('Photo deleted successfully!');
      if (url === currentPhotoURL) {
        onPhotoSelect('');
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
      toast.error('Failed to delete photo. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Photos</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[700px] lg:max-w-[900px]">
        <DialogTitle className="text-2xl font-bold mb-4">Photo Gallery</DialogTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Profile photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg transition-all duration-300 group-hover:opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  variant="destructive"
                  size="icon"
                  className="mr-2"
                  onClick={() => handlePhotoDelete(photo)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => {
                    onPhotoSelect(photo);
                    setIsOpen(false);
                  }}
                  disabled={photo === currentPhotoURL}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
              {photo === currentPhotoURL && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  Current
                </div>
              )}
            </div>
          ))}
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center cursor-pointer">
            <input {...getInputProps()} />
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-1 text-sm text-gray-600">Click or drag to upload</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};