import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Code, Briefcase, Clock, ExternalLink, ChevronLeft, ChevronRight, Award, Star, Sparkles } from 'lucide-react';
import { Project } from '../types';
import { TextGenerateEffect } from './ui/text-generate-effect';
import GlassCard from './GlassCard';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import { useRef } from 'react';

// Remove Unsplash API dependency for better privacy and performance
interface HomeProps {
  name: string;
  about: string;
  skills: string[];
  featuredProject: Project | null;
  numberOfProjects: number;
  experienceYears: number;
}

// Improved Tag component with better styling
const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.span
    whileHover={{ scale: 1.05, y: -2 }}
    className="bg-gradient-to-r from-purple-700/30 to-indigo-700/30 text-purple-100 px-3 py-1 rounded-full text-xs font-medium mr-2 mb-2 inline-block backdrop-blur-sm border border-purple-500/20 shadow-sm"
  >
    {children}
  </motion.span>
);

// Enhanced gradient text component
const GradientText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 ${className}`}>
    {children}
  </span>
);

// Optimized carousel component
const ProjectCarousel: React.FC<{ projects: Project[] }> = ({ projects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(carouselRef);

  useEffect(() => {
    if (!isInView || projects.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isInView, projects.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="w-full h-48 md:h-64 flex items-center justify-center bg-gray-800/50 rounded-lg">
        <p className="text-gray-400">No projects available</p>
      </div>
    );
  }

  return (
    <div ref={carouselRef} className="relative w-full h-48 md:h-64 overflow-hidden rounded-lg shadow-lg">
      {projects.map((project, index) => (
        <motion.div
          key={project.id || index}
          className="absolute w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: index === currentIndex ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
          <Image 
            src={project.coverPhoto || '/placeholder-project.jpg'} 
            alt={project.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <h4 className="text-white font-bold text-lg truncate">{project.name}</h4>
          </div>
        </motion.div>
      ))}
      
      {/* Navigation dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
        {projects.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white w-4' 
                : 'bg-white/40 hover:bg-white/60'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
      
      {/* Navigation arrows */}
      {projects.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-2 transition-all z-30"
            onClick={() => goToSlide((currentIndex - 1 + projects.length) % projects.length)}
          >
            <ChevronLeft className="text-white" size={20} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full p-2 transition-all z-30"
            onClick={() => goToSlide((currentIndex + 1) % projects.length)}
          >
            <ChevronRight className="text-white" size={20} />
          </button>
        </>
      )}
    </div>
  );
};

// Main Home component with improved architecture
const Home: React.FC<HomeProps> = ({
  name,
  about,
  skills,
  numberOfProjects,
  experienceYears,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [featuredProject, setFeaturedProject] = useState<Project | null>(null);
  const [showcaseProjects, setShowcaseProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Section references for scroll animations
  const aboutRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  
  const isAboutInView = useInView(aboutRef, { once: true, amount: 0.3 });
  const isSkillsInView = useInView(skillsRef, { once: true, amount: 0.3 });
  const isProjectsInView = useInView(projectsRef, { once: true, amount: 0.3 });

  // Memoized skill tags to prevent re-renders
  const skillTags = useMemo(() => {
    return skills.map((skill, index) => (
      <Tag key={index}>{skill}</Tag>
    ));
  }, [skills]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        
        // Fetch featured project
        const featuredQuery = query(
          collection(db, 'projects'), 
          where('isFeatured', '==', true),
          limit(1)
        );
        
        // Fetch showcase projects
        const showcaseQuery = query(
          collection(db, 'projects'),
          where('showInCarousel', '==', true),
          limit(5)
        );
        
        const [featuredSnapshot, showcaseSnapshot] = await Promise.all([
          getDocs(featuredQuery),
          getDocs(showcaseQuery)
        ]);
        
        if (!featuredSnapshot.empty) {
          const featuredDoc = featuredSnapshot.docs[0];
          setFeaturedProject({ 
            id: featuredDoc.id, 
            ...featuredDoc.data() 
          } as Project);
        }
        
        if (!showcaseSnapshot.empty) {
          const showcaseProjects = showcaseSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Project));
          setShowcaseProjects(showcaseProjects);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Helper function to safely truncate HTML content
  const truncateDescription = (html: string, maxLength: number) => {
    // Create a DOM element to safely parse HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Animation variants for staggered card animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-16 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          ref={aboutRef}
          variants={containerVariants}
          initial="hidden"
          animate={isAboutInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {/* About me card */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <GlassCard className="h-full" gradient="from-blue-600/10 to-purple-600/10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Hi, I&apos;m <GradientText>{name}</GradientText>
              </h2>
              <div className="text-xl md:text-2xl leading-relaxed tracking-wide text-gray-200">
                <TextGenerateEffect words={about} />
              </div>
            </GlassCard>
          </motion.div>

          {/* Skills card */}
          <motion.div variants={itemVariants} ref={skillsRef}>
            <GlassCard className="h-full" gradient="from-indigo-600/10 to-purple-600/10">
              <h3 className="text-xl font-bold mb-4 flex items-center text-white">
                <Code className="mr-2 text-indigo-400" size={24} /> 
                <GradientText>Skills</GradientText>
              </h3>
              <div className="flex flex-wrap">
                {skillTags}
              </div>
            </GlassCard>
          </motion.div>

          {/* Featured project card */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <GlassCard 
              className="h-full" 
              gradient="from-purple-600/10 to-pink-600/10"
            >
              <div className="flex items-center mb-4">
                <Sparkles className="mr-2 text-purple-400" size={20} />
                <h3 className="text-xl font-bold text-white">
                  <GradientText>Featured Project</GradientText>
                </h3>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : featuredProject ? (
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="relative w-full md:w-24 h-24 flex-shrink-0">
                    <Image
                      src={featuredProject.coverPhoto || '/placeholder-image.jpg'}
                      alt={featuredProject.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 96px"
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2 text-white">{featuredProject.name}</h4>
                    <div 
                      className="text-gray-300 text-sm mb-3"
                      dangerouslySetInnerHTML={{ 
                        __html: truncateDescription(featuredProject.description, 150) 
                      }}
                    />
                    <div className="flex flex-wrap items-center gap-4">
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={featuredProject.buttonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-gradient-to-r from-purple-700/60 to-indigo-700/60 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-purple-600/70 hover:to-indigo-600/70 transition-all backdrop-blur-sm shadow-md"
                      >
                        {featuredProject.buttonType === 'download' ? 'Download' : 'View'} Project 
                        <ExternalLink size={16} className="ml-2" />
                      </motion.a>
                      {featuredProject.description.length > 150 && (
                        <Button
                          variant="link"
                          onClick={() => setIsDialogOpen(true)}
                          className="p-0 h-auto font-medium text-indigo-400 hover:text-indigo-300"
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

          {/* Stats cards */}
          <motion.div variants={itemVariants} ref={projectsRef}>
            <GlassCard 
              className="h-full flex flex-col justify-between" 
              gradient="from-amber-500/10 to-orange-600/10"
            >
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center text-white">
                  <Briefcase className="mr-2 text-amber-400" size={24} /> 
                  <GradientText>Projects</GradientText>
                </h3>
                <p className="text-sm text-gray-300">Completed projects</p>
              </div>
              <div className="mt-6">
                <p className="text-4xl font-bold text-white">{numberOfProjects}+</p>
                <p className="text-sm text-gray-400 mt-1">
                  Delivering high-quality solutions
                </p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <GlassCard 
              className="h-full flex flex-col justify-between" 
              gradient="from-emerald-500/10 to-teal-600/10"
            >
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center text-white">
                  <Clock className="mr-2 text-emerald-400" size={24} /> 
                  <GradientText>Experience</GradientText>
                </h3>
                <p className="text-sm text-gray-300">Years in the field</p>
              </div>
              <div className="mt-4">
                <p className="text-4xl font-bold text-white">{experienceYears}</p>
                <div className="flex items-center mt-2">
                  <Award className="text-yellow-400 mr-2" size={20} />
                  <p className="text-sm text-gray-300">Senior Developer</p>
                </div>
                <div className="flex items-center mt-1">
                  <Star className="text-yellow-400 mr-2" size={20} />
                  <p className="text-sm text-gray-300">Top-rated freelancer</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Project showcase carousel */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1">
            <GlassCard 
              className="h-full" 
              gradient="from-blue-600/10 to-teal-600/10"
            >
              <h3 className="text-xl font-bold mb-4 text-white">
                <GradientText>Project Showcase</GradientText>
              </h3>
              <ProjectCarousel projects={showcaseProjects} />
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>

      {/* Featured project dialog */}
      {featuredProject && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gray-800/95 text-white border border-gray-700 max-w-3xl backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                <GradientText>{featuredProject.name}</GradientText>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] mt-2 pr-4">
              <div 
                className="text-gray-300 prose prose-invert max-w-none prose-headings:text-purple-300 prose-a:text-indigo-300 hover:prose-a:text-indigo-200"
                dangerouslySetInnerHTML={{ __html: featuredProject.description }}
              />
              
              {/* Project links and actions */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                <Button 
                  variant="outline"
                  className="border-purple-600/40 text-purple-300 hover:bg-purple-950/30"
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
                  className="inline-flex items-center bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-6 py-2 rounded-full text-sm font-semibold hover:from-purple-600 hover:to-indigo-600 transition-colors shadow-md"
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