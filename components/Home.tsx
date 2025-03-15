import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { Code, Briefcase, Clock, ExternalLink, Award, Star, Sparkles } from 'lucide-react';
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

// Main Home component with bento grid layout
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
  
  // Section references for scroll animations
  const bentoGridRef = useRef<HTMLDivElement>(null);
  const isBentoGridInView = useInView(bentoGridRef, { once: true, amount: 0.2 });

  // Memoized skill tags to prevent re-renders
  const skillTags = useMemo(() => {
    return skills.map((skill, index) => (
      <Tag key={index}>{skill}</Tag>
    ));
  }, [skills]);

  useEffect(() => {
    const fetchFeaturedProject = async () => {
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
      } catch (error) {
        console.error('Failed to fetch featured project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProject();
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
          ref={bentoGridRef}
          variants={containerVariants}
          initial="hidden"
          animate={isBentoGridInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6"
        >
          {/* About me card - spans 8 columns on large screens, full width on small */}
          <motion.div variants={itemVariants} className="md:col-span-4 lg:col-span-8">
            <GlassCard className="h-full" gradient="from-blue-600/10 to-purple-600/10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Hi, I&apos;m <GradientText>{name}</GradientText>
              </h2>
              <div className="text-xl md:text-2xl leading-relaxed tracking-wide text-gray-200">
                <TextGenerateEffect words={about} />
              </div>
            </GlassCard>
          </motion.div>

          {/* Skills card - spans 4 columns on large screens */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-4">
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

          {/* Featured project card - spans 8 columns on large screens */}
          <motion.div variants={itemVariants} className="md:col-span-4 lg:col-span-8">
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

          {/* Projects stats card - spans 2 columns on medium screens, 2 on large */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
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

          {/* Experience stats card - spans 2 columns on medium screens, 2 on large */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2">
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