'use client'

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import ClientPortfolio from './ClientPortfolio';
import { Profile, Project, Skill } from '../types';

function usePortfolioData() {
  const [data, setData] = useState<{ profile: Profile | null, projects: Project[], skills: Skill[] }>({
    profile: null,
    projects: [],
    skills: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const profileSnapshot = await getDocs(collection(db, 'profile'));
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const skillsSnapshot = await getDocs(collection(db, 'skills'));

        let profile: Profile | null = null;
        if (!profileSnapshot.empty) {
          profile = profileSnapshot.docs[0].data() as Profile;
        } else {
          console.error('No profile document found in Firestore');
        }

        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        const skills = skillsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill));

        setData({ profile, projects, skills });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch portfolio data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

export default function Portfolio() {
  const { data, loading, error } = usePortfolioData();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!data.profile) {
    return <div>Error: Profile data not found. Please check your database.</div>;
  }
  
  return <ClientPortfolio profile={data.profile} projects={data.projects} skills={data.skills} />;
}