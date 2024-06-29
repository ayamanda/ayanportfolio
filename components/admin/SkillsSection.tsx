import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { collection, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Skill } from '../../types';

export const SkillsSection: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const { register, handleSubmit, reset } = useForm<{ name: string }>();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    const querySnapshot = await getDocs(collection(db, 'skills'));
    const skillsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill));
    setSkills(skillsData);
  };

  const onSubmit = async (data: { name: string }) => {
    try {
      await addDoc(collection(db, 'skills'), data);
      alert('Skill added successfully!');
      reset();
      fetchSkills();
    } catch (error) {
      console.error('Skill addition failed:', error);
      alert('Failed to add skill. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await deleteDoc(doc(db, 'skills', id));
        alert('Skill deleted successfully!');
        fetchSkills();
      } catch (error) {
        console.error('Skill deletion failed:', error);
        alert('Failed to delete skill. Please try again.');
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Skills</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
        <input {...register('name')} placeholder="Skill Name" className="w-full p-2 bg-gray-700 rounded" />
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
          Add Skill
        </button>
      </form>

      <div className="flex flex-wrap">
        {skills.map((skill) => (
          <div key={skill.id} className="bg-gray-800 text-white px-3 py-1 rounded-full mr-2 mb-2 flex items-center">
            <span>{skill.name}</span>
            <button onClick={() => handleDelete(skill.id)} className="ml-2 text-red-500 hover:text-red-600">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};