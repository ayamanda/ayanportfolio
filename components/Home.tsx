import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Code, Briefcase, Clock, ExternalLink, Award, Star, Sparkles } from 'lucide-react';
import { Project, Experience } from '../types';
import { TextGenerateEffect } from './ui/text-generate-effect';
import GlassCard from './GlassCard';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRef } from 'react';
import { Timeline } from './Timeline';

interface HomeProps {
  name: string;
  about: string;
  skills: string[];
  featuredProject: Project | null;
  numberOfProjects: number;
  experienceYears: number;
}

// Enhanced Tag component with better hover effects
const Tag: React.FC<{ children: React.ReactNode; index: number }> = ({ children, index }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.8, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ 
      duration: 0.5, 
      delay: index * 0.1,
      type: "spring",
      stiffness: 100
    }}
    whileHover={{ 
      scale: 1.1, 
      y: -4,
      boxShadow: "0 10px 25px rgba(147, 51, 234, 0.3)"
    }}
    whileTap={{ scale: 0.95 }}
    className="bg-gradient-to-r from-purple-700/40 to-indigo-700/40 text-purple-100 px-4 py-2 rounded-full text-sm font-medium mr-3 mb-3 inline-block backdrop-blur-md border border-purple-500/30 shadow-lg hover:border-purple-400/50 transition-all duration-300"
  >
    {children}
  </motion.span>
);

// Enhanced gradient text component with animated gradient
const GradientText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.span 
    className={`bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 bg-size-200 bg-pos-0 hover:bg-pos-100 transition-all duration-700 ${className}`}
    style={{
      backgroundSize: '200% 200%',
    }}
    animate={{
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse"
    }}
  >
    {children}
  </motion.span>
);

// Floating particles background for hero section
const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle}
          className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};

// Main Home component with redesigned layout
const Home: React.FC<HomeProps> = ({
  name,
  about,
  skills,
  numberOfProjects,
  experienceYears,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [featuredProject, setFeaturedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  
  // Section references for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const bentoGridRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const isBentoGridInView = useInView(bentoGridRef, { once: true, amount: 0.2 });

  // Memoized skill tags to prevent re-renders
  const skillTags = useMemo(() => {
    return skills.map((skill, index) => (
      <Tag key={index} index={index}>{skill}</Tag>
    ));
  }, [skills]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch featured project
        const featuredQuery = query(
          collection(db, 'projects'), 
          where('isFeatured', '==', true),
          limit(1)
        );
        
        const featuredSnapshot = await getDocs(featuredQuery);
        
        if (!featuredSnapshot.empty) {
          const featuredDoc = featuredSnapshot.docs[0];
          setFeaturedProject({ 
            id: featuredDoc.id, 
            ...featuredDoc.data() 
          } as Project);
        }

        // Fetch experiences
        const experiencesQuery = query(
          collection(db, 'experiences'),
          orderBy('order', 'desc')
        );
        const experiencesSnapshot = await getDocs(experiencesQuery);
        const experiencesData = experiencesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Experience[];
        setExperiences(experiencesData);

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to safely truncate HTML content
  const truncateDescription = (html: string, maxLength: number) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Animation variants for hero section
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const heroItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  // Animation variants for bento grid
  const bentoVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const bentoItemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        type: "spring",
        stiffness: 80
      }
    }
  };

  return (
    <section className="py-16 px-4 min-h-screen">
      {/* Hero Section - Centered About */}
      <motion.div 
        ref={heroRef}
        variants={heroVariants}
        initial="hidden"
        animate={isHeroInView ? "visible" : "hidden"}
        className="relative max-w-6xl mx-auto text-center mb-24"
      >
        <FloatingParticles />
        
        <motion.div variants={heroItemVariants} className="relative z-10">
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <span className="text-white">Hi, I&apos;m </span>
            <GradientText className="inline-block">{name}</GradientText>
          </motion.h1>
        </motion.div>

        <motion.div 
          variants={heroItemVariants}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <div className="text-2xl md:text-3xl lg:text-4xl leading-relaxed tracking-wide text-gray-200 font-light">
            <TextGenerateEffect words={about} />
          </div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-48 h-48 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </motion.div>

      {/* Bento Grid Section */}
      <div className="max-w-7xl mx-auto">
        <motion.div 
          ref={bentoGridRef}
          variants={bentoVariants}
          initial="hidden"
          animate={isBentoGridInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Skills Card */}
          <motion.div 
            variants={bentoItemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="md:col-span-2"
          >
            <GlassCard className="h-full" gradient="from-indigo-600/15 to-purple-600/15">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center text-white">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Code className="mr-3 text-indigo-400" size={28} />
                  </motion.div>
                  <GradientText>Skills & Technologies</GradientText>
                </h3>
                <div className="flex flex-wrap">
                  {skillTags}
                </div>
              </motion.div>
            </GlassCard>
          </motion.div>

          {/* Projects Stats Card */}
          <motion.div 
            variants={bentoItemVariants}
            whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
          >
            <GlassCard 
              className="h-full flex flex-col justify-between" 
              gradient="from-amber-500/15 to-orange-600/15"
            >
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center text-white">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Briefcase className="mr-3 text-amber-400" size={24} />
                  </motion.div>
                  <GradientText>Projects</GradientText>
                </h3>
                <p className="text-sm text-gray-300">Completed projects</p>
              </div>
              <div className="mt-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                >
                  <p className="text-5xl font-bold text-white mb-2">{numberOfProjects}+</p>
                </motion.div>
                <p className="text-sm text-gray-400">
                  Delivering high-quality solutions
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Experience Stats Card */}
          <motion.div 
            variants={bentoItemVariants}
            whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
          >
            <GlassCard 
              className="h-full flex flex-col justify-between" 
              gradient="from-emerald-500/15 to-teal-600/15"
            >
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center text-white">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock className="mr-3 text-emerald-400" size={24} />
                  </motion.div>
                  <GradientText>Experience</GradientText>
                </h3>
                <p className="text-sm text-gray-300">Years in the field</p>
              </div>
              <div className="mt-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                >
                  <p className="text-5xl font-bold text-white mb-3">{experienceYears}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="space-y-2"
                >
                  <div className="flex items-center">
                    <Award className="text-yellow-400 mr-2" size={16} />
                    <p className="text-xs text-gray-300">Senior Developer</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="text-yellow-400 mr-2" size={16} />
                    <p className="text-xs text-gray-300">Top-rated freelancer</p>
                  </div>
                </motion.div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Featured Project Card */}
          <motion.div 
            variants={bentoItemVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
            className="md:col-span-2 lg:col-span-4"
          >
            <GlassCard 
              className="h-full" 
              gradient="from-purple-600/15 to-pink-600/15"
            >
              <div className="flex items-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="mr-3 text-purple-400" size={24} />
                </motion.div>
                <h3 className="text-2xl font-bold text-white">
                  <GradientText>Featured Project</GradientText>
                </h3>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <motion.div 
                    className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : featuredProject ? (
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <motion.div 
                    className="relative w-full lg:w-32 h-32 flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={featuredProject.coverPhoto || '/placeholder-image.jpg'}
                      alt={featuredProject.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 128px"
                      className="rounded-xl object-cover shadow-lg"
                    />
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold mb-3 text-white">{featuredProject.name}</h4>
                    <div 
                      className="text-gray-300 text-sm mb-4 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: truncateDescription(featuredProject.description, 200) 
                      }}
                    />
                    <div className="flex flex-wrap items-center gap-4">
                      <motion.a
                        whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(147, 51, 234, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        href={featuredProject.buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-gradient-to-r from-purple-700/70 to-indigo-700/70 text-white px-6 py-3 rounded-full text-sm font-semibold hover:from-purple-600/80 hover:to-indigo-600/80 transition-all backdrop-blur-sm shadow-lg border border-purple-500/20"
                      >
                        {featuredProject.buttonType === 'download' ? 'Download' : 'View'} Project 
                        <ExternalLink size={16} className="ml-2" />
                      </motion.a>
                      {featuredProject.description.length > 200 && (
                        <Button
                          variant="link"
                          onClick={() => setIsDialogOpen(true)}
                          className="p-0 h-auto font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Read More
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 text-sm">No featured project available.</p>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>

      {/* Experience Timeline Section */}
      <div className="max-w-7xl mx-auto mt-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-12 text-white flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Briefcase className="mr-4 text-purple-400" size={32} />
            </motion.div>
            <GradientText>Experience Timeline</GradientText>
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <motion.div 
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          ) : (
            <Timeline experiences={experiences} />
          )}
        </motion.div>
      </div>

      {/* Featured project dialog */}
      {featuredProject && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-900/95 text-white border border-gray-700/50 max-w-4xl backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-3xl mb-4">
                <GradientText>{featuredProject.name}</GradientText>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[70vh] mt-4 pr-6">
              <div 
                className="text-gray-300 prose prose-invert max-w-none prose-headings:text-purple-300 prose-a:text-indigo-300 hover:prose-a:text-indigo-200 prose-lg"
                dangerouslySetInnerHTML={{ __html: featuredProject.description }}
              />
              
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700/50">
                <Button 
                  variant="outline"
                  className="border-purple-600/40 text-purple-300 hover:bg-purple-950/40 px-6 py-2"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={featuredProject.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-8 py-3 rounded-full text-sm font-semibold hover:from-purple-600 hover:to-indigo-600 transition-colors shadow-lg"
                >
                  {featuredProject.buttonType === 'download' ? 'Download' : 'View'} Project 
                  <ExternalLink size={16} className="ml-2" />
                </motion.a>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};

export default Home;