'use client'
export const runtime = 'edge';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Project } from '@/types';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';
import ProjectDetail from '@/components/ProjectDetail';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ProjectPageProps {
  params: {
    slug: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProject() {
      try {
        setLoading(true);
        
        // First try to fetch by slug if it doesn't look like a Firestore ID
        let projectData: Project | null = null;
        
        // Try to fetch by slug first
        let projectQuery = query(
          collection(db, 'projects'),
          where('slug', '==', slug)
        );
        
        let projectSnapshot = await getDocs(projectQuery);
        
        // If no results, try to fetch directly by ID
        if (projectSnapshot.empty) {
          try {
            // Try direct document lookup by ID
            const projectDoc = await getDoc(doc(db, 'projects', slug));
            
            if (projectDoc.exists()) {
              projectData = { id: projectDoc.id, ...projectDoc.data() } as Project;
            } else {
              // Last attempt - query by ID as a field
              projectQuery = query(
                collection(db, 'projects'),
                where('id', '==', slug)
              );
              projectSnapshot = await getDocs(projectQuery);
              
              if (!projectSnapshot.empty) {
                projectData = { id: projectSnapshot.docs[0].id, ...projectSnapshot.docs[0].data() } as Project;
              }
            }
          } catch (idError) {
            console.error('Error fetching by ID:', idError);
          }
        } else {
          projectData = { id: projectSnapshot.docs[0].id, ...projectSnapshot.docs[0].data() } as Project;
        }
        
        if (!projectData) {
          setError('Project not found');
          return;
        }
        
        setProject(projectData);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProject();
  }, [slug]);
  
  if (loading) {
    return <Loader />;
  }
  
  if (error || !project) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-xl max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-red-400">{error || 'Project not found'}</h2>
          <p className="text-gray-300 mb-6">
            The project you are looking for doesnt exist or may have been moved.
          </p>
          <Button
            onClick={() => router.push('/projects')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-6 py-3 font-medium mx-auto"
          >
            <ArrowLeft size={18} />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }
  
  return <ProjectDetail project={project} />;
}