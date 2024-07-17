import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Skill } from '../../types';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export const SkillsSection: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const { register, handleSubmit, reset } = useForm<{ name: string }>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'skills'));
      const skillsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill));
      setSkills(skillsData);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      toast.error('Failed to fetch skills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: { name: string }) => {
    try {
      await addDoc(collection(db, 'skills'), data);
      toast.success('Skill added successfully!');
      reset();
      fetchSkills();
    } catch (error) {
      console.error('Skill addition failed:', error);
      toast.error('Failed to add skill. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await deleteDoc(doc(db, 'skills', id));
        toast.success('Skill deleted successfully!');
        setSkills(skills.filter(skill => skill.id !== id));
      } catch (error) {
        console.error('Skill deletion failed:', error);
        toast.error('Failed to delete skill. Please try again.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
            <div className="flex space-x-2">
              <Input {...register('name')} placeholder="Skill Name" className="flex-grow" />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </motion.div>
            </div>
          </form>

          {loading ? (
            <div className="text-center">Loading skills...</div>
          ) : (
            <motion.div 
              className="flex flex-wrap gap-2"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <AnimatePresence>
                {skills.map((skill) => (
                  <motion.div
                    key={skill.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge 
                      variant="secondary" 
                      className="text-sm py-1 px-2 flex items-center"
                    >
                      {skill.name}
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handleDelete(skill.id)}
                        className="ml-2 bg-transparent border-none cursor-pointer p-0 flex items-center"
                      >
                        <X className="h-3 w-3 text-gray-500 hover:text-red-500 transition-colors" />
                      </motion.button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};