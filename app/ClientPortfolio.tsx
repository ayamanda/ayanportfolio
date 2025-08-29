'use client'
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Profile, Project, Skill } from '../types';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Home from '@/components/Home';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Chatbot from '@/components/Chatbot';
import SectionTransition from '@/components/SectionTransition';
import { useSectionTransition, SectionName } from '@/hooks/useSectionTransition';
import { motion, useScroll, useSpring, useMotionValue, useTransform } from 'framer-motion';

const Loader = dynamic(() => import('../components/Loader'), { ssr: false });

interface ClientPortfolioProps {
  profile: Profile | null;
  projects: Project[];
  skills: Skill[];
}

const ClientPortfolio: React.FC<ClientPortfolioProps> = ({ profile, projects, skills }) => {
  const [loading, setLoading] = useState(true);
  const [isNavSticky, setIsNavSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Use the section transition hook
  const { sectionState, setActiveSection, setSectionLoading, isCurrentSectionLoading } = useSectionTransition('home', 600);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const x = useTransform(mouseX, [0, windowSize.width], [0, 100]);
  const y = useTransform(mouseY, [0, windowSize.height], [0, 100]);

  const featuredProject = useMemo(() => projects[0] || null, [projects]);

  const handleScroll = useCallback(() => {
    if (headerRef.current && navRef.current) {
      const headerBottom = headerRef.current.offsetTop + headerRef.current.offsetHeight;
      const scrollPosition = window.scrollY;
      setIsNavSticky(scrollPosition > headerBottom);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  const handleResize = useCallback(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    handleResize();
    const timer = setTimeout(() => setLoading(false), 1500);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleScroll, handleMouseMove, handleResize]);

  if (!profile) {
    return <div>Error: Profile data not found. Please check your database.</div>;
  }

  const socialLinks = {
    twitter: profile.twitterURL,
    linkedin: profile.linkedinURL,
    instagram: profile.instagramURL,
    github: profile.githubURL,
    upwork: profile.upworkURL,
    email: profile.email 
  };

  const floatingElements = ['&lt;/', '{}', '[]', '//', '( )', '// TODO', '&lt;div&gt;', '&lt;/div&gt;'];

   return (
    
    <div className="min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden">
      <style jsx global>{`
        /* Hide default scrollbar */
        ::-webkit-scrollbar {
          display: none;
        }
        
        /* Custom scrollbar styles */
        .custom-scrollbar {
          position: fixed;
          top: 0;
          right: 0;
          width: 8px;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.1);
          z-index: 1000;
        }
        
        .scrollbar-thumb {
          width: 100%;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }
        
        .scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.8);
        }
        
        /* For Firefox */
        * {
          scrollbar-width: none;
        }
      `}</style>

      {/* Custom scrollbar */}
      <motion.div className="custom-scrollbar">
        <motion.div 
          className="scrollbar-thumb"
          style={{ 
            height: scrollYProgress,
            scaleY: scaleX
          }}
        />
      </motion.div>

      <div className="fixed inset-0 bg-[url('/path-to-your-background-image.jpg')] bg-cover bg-center opacity-10 z-0"></div>
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 z-50"
        style={{ scaleX }}
      />

      {loading ? (
        <Loader />
      ) : (
        <div className="relative z-10">
          <motion.div 
            ref={headerRef} 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Header 
              name={profile.name} 
              title={profile.title} 
              photoURL={profile.photoURL} 
              socialLinks={socialLinks}
            />
          </motion.div>
          
          <motion.div 
            ref={navRef} 
            className={`${isNavSticky ? 'fixed top-0 left-0 right-0 z-50' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            <Navbar activeSection={sectionState.activeSection} setActiveSection={setActiveSection} isSticky={isNavSticky} />
          </motion.div>
          
          <main className={`${isNavSticky ? 'pt-16' : ''}`}>
            <SectionTransition
              activeSection={sectionState.activeSection}
              animationType="fade"
              transitionDuration={0.6}
              isLoading={isCurrentSectionLoading}
              className="min-h-screen"
            >
              {sectionState.activeSection === 'home' && (
                <Home 
                  name={profile.name}
                  about={profile.about}
                  skills={skills.map(skill => skill.name)}
                  featuredProject={featuredProject}
                  numberOfProjects={projects.length}
                  experienceYears={3} 
                />
              )}
              
              {sectionState.activeSection === 'projects' && (
                <Projects projects={projects} />
              )}
              
              {sectionState.activeSection === 'contact' && (
                <Contact />
              )}
            </SectionTransition>
          </main>

          <motion.footer 
            className="py-6 bg-opacity-50 backdrop-filter backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="container mx-auto px-4 text-center text-gray-400">
              <p>&copy; 2024 {profile.name}. All rights reserved.</p>
            </div>
          </motion.footer>
        </div>
      )}

      {floatingElements.map((item, index) => (
        <motion.div
          key={index}
          className="fixed text-2xl text-purple-300 opacity-20 pointer-events-none font-mono"
          initial={{ 
            x: Math.random() * windowSize.width, 
            y: Math.random() * windowSize.height,
            scale: 0,
            rotate: Math.random() * 360 
          }}
          animate={{ 
            scale: 1,
            rotate: Math.random() * 360 
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: 'reverse',
            delay: index * 0.2
          }}
          style={{ x, y }}
        >
          {item}
        </motion.div>
      ))}
      <Chatbot profile={profile} projects={projects} skills={skills} />
    </div>
  );
};

export default ClientPortfolio;