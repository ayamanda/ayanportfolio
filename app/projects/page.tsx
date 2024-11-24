import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Project } from '../types';

async function getProjects(): Promise<Project[]> {
  try {
    const projectsCollection = collection(db, 'projects');
    const projectsSnapshot = await getDocs(projectsCollection);
    return projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <Projects projects={projects} />;
}
