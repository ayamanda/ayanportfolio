'use client'

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Project } from '@/types';
import ProjectCard from '@/components/ProjectCard';
import Loader from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function ProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const slug = searchParams.get('slug');
  const id = searchParams.get('id');

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const projectsCollection = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsCollection);
        
        if (projectsSnapshot.empty) {
          setProjects([]);
          return;
        }
        
        const projectsList = projectsSnapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            // Ensure slug exists for all projects
            slug: data.slug || doc.id
          } as Project;
        });
        
        setProjects(projectsList);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjects();
  }, []);
  
  if (loading) {
    return <Loader />;
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-xl max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-red-400">{error}</h2>
          <p className="text-gray-300 mb-6">
            We encountered an error while loading projects. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <section className="py-12 px-4 bg-gradient-to-b from-gray-900 to-black min-h-screen">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <Button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-6 py-3 font-medium transition-all duration-300 transform hover:scale-105"
            variant="ghost"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Button>
        </div>

        <h1 className="text-5xl font-bold mb-12 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent text-center">
          My Projects
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              shareableLink={project.slug ? `/projects/${project.slug}` : `/projects/${project.id}`}
              initialOpen={!!((slug && project.slug === slug) || (id && project.id === id))}
            />
          ))}
        </div>
        
        {projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg font-medium">No projects available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ProjectsContent />
    </Suspense>
  );
}