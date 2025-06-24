import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Experience } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExperienceForm } from './ExperienceForm';
import { ExperienceCard } from './ExperienceCard';

export const ExperienceSection = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setIsLoading(true);
      const experiencesQuery = query(collection(db, 'experiences'), orderBy('order', 'desc'));
      const snapshot = await getDocs(experiencesQuery);
      const experiencesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Experience[];
      setExperiences(experiencesData);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExperience = async (experienceData: Omit<Experience, 'id'>) => {
    try {
      const dataToAdd = {
        ...experienceData,
        technologies: Array.isArray(experienceData.technologies) ? experienceData.technologies : [],
      };
      await addDoc(collection(db, 'experiences'), dataToAdd);
      await fetchExperiences();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error adding experience:', error);
    }
  };

  const handleUpdateExperience = async (data: Omit<Experience, 'id'>) => {
    if (!selectedExperience?.id) return;
    
    try {
      const dataToUpdate = {
        ...data,
        technologies: Array.isArray(data.technologies) ? data.technologies : [],
      };
      await updateDoc(doc(db, 'experiences', selectedExperience.id), dataToUpdate);
      await fetchExperiences();
      setIsDialogOpen(false);
      setSelectedExperience(null);
    } catch (error) {
      console.error('Error updating experience:', error);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'experiences', id));
      await fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  const handleEdit = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Experience</h2>
        <Button
          onClick={() => {
            setSelectedExperience(null);
            setIsDialogOpen(true);
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Add Experience
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {experiences.map((experience) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              onEdit={() => handleEdit(experience)}
              onDelete={() => handleDeleteExperience(experience.id)}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-800">
          <DialogHeader>
            <DialogTitle>
              {selectedExperience ? 'Edit Experience' : 'Add Experience'}
            </DialogTitle>
          </DialogHeader>
          <ExperienceForm
            experience={selectedExperience}
            onSubmit={selectedExperience ? handleUpdateExperience : handleAddExperience}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}; 