import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import ClientPortfolio from './ClientPortfolio';
import { Profile, Project, Skill } from '../types';

async function getData() {
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

    return {
      profile,
      projects,
      skills,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { profile: null, projects: [], skills: [] };
  }
}

export default async function Portfolio() {
  const { profile, projects, skills } = await getData();
  
  if (!profile) {
    return <div>Error: Profile data not found. Please check your database.</div>;
  }
  
  return <ClientPortfolio profile={profile} projects={projects} skills={skills} />;
}

// Enable Incremental Static Regeneration
export const revalidate = 60; // Revalidate every 60 seconds