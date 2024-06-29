'use client'
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Profile, Project, Skill } from '../types';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Home from '@/components/Home';
import Skills from '@/components/Skills';
import FeaturedProject from '@/components/FeaturedProject';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';

const Loader = dynamic(() => import('../components/Loader'), { ssr: false });

interface ClientPortfolioProps {
  profile: Profile | null;
  projects: Project[];
  skills: Skill[];
}

const ClientPortfolio: React.FC<ClientPortfolioProps> = ({ profile, projects, skills }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (!profile) {
    return <div>Error: Profile data not found. Please check your database.</div>;
  }

  const featuredProject = projects[0]; // Assuming the first project is the featured one

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100 overflow-x-hidden">
      <div className="fixed inset-0 bg-[url('/path-to-your-background-image.jpg')] bg-cover bg-center opacity-10 z-0"></div>
      {loading ? (
        <Loader />
      ) : (
        <div className="relative z-10">
          <Header name={profile.name} title={profile.title} photoURL={profile.photoURL} />
          <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
          
          <main>
            {activeSection === 'home' && (
              <>
                <Home 
                  name={profile.name} 
                  photoURL={profile.photoURL} 
                  about={profile.about} 
                  skills={skills.map(skill => skill.name)} 
                  featuredProject={featuredProject} 
                  numberOfProjects={projects.length} 
                  experienceYears={3} 
                />
              </>
            )}
            
            {activeSection === 'projects' && (
              <Projects projects={projects} />
            )}
            
            {activeSection === 'contact' && (
              <Contact />
            )}
          </main>

          <footer className="py-6 bg-gray-900 bg-opacity-50 backdrop-blur-lg">
            <div className="container mx-auto px-4 text-center text-gray-400">
              <p>&copy; 2024 {profile.name}. All rights reserved.</p>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default ClientPortfolio;
