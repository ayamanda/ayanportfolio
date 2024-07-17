'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Profile, Project, Skill } from '../types';
import Header from '@/components/Header';
import Navbar from '@/components/Navbar';
import Home from '@/components/Home';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import { motion, useScroll, useSpring, useMotionValue, useTransform } from 'framer-motion';

const Loader = dynamic(() => import('../components/Loader'), { ssr: false });

interface ClientPortfolioProps {
  profile: Profile | null;
  projects: Project[];
  skills: Skill[];
}

const ClientPortfolio: React.FC<ClientPortfolioProps> = ({ profile, projects, skills }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [loading, setLoading] = useState(true);
  const [isNavSticky, setIsNavSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

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
    // Set initial window size
    handleResize();

    // Set loading to false after a delay
    const timer = setTimeout(() => setLoading(false), 1500);

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Remove event listeners on cleanup
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

  const featuredProject = projects[0];

  const floatingElements = ['&lt;/', '{}', '[]', '//', '( )', '// TODO', '&lt;div&gt;', '&lt;/div&gt;'];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden">
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
            <Header name={profile.name} title={profile.title} photoURL={profile.photoURL} />
          </motion.div>
          
          <motion.div 
            ref={navRef} 
            className={`${isNavSticky ? 'fixed top-0 left-0 right-0 z-50' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          >
            <Navbar activeSection={activeSection} setActiveSection={setActiveSection} isSticky={isNavSticky} />
          </motion.div>
          
          <main className={`${isNavSticky ? 'pt-16' : ''}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {activeSection === 'home' && (
                <Home 
                  name={profile.name}
                  about={profile.about}
                  skills={skills.map(skill => skill.name)}
                  featuredProject={featuredProject}
                  numberOfProjects={projects.length}
                  experienceYears={3} 
                />
              )}
              
              {activeSection === 'projects' && (
                <Projects projects={projects} />
              )}
              
              {activeSection === 'contact' && (
                <Contact />
              )}
            </motion.div>
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

      {/* Floating elements */}
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
    </div>
  );
};

export default ClientPortfolio;