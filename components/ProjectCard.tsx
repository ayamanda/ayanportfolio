import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Project } from '../types';
import GlassCard from './GlassCard';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Heart, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface ProjectCardProps {
  project: Project;
  shareableLink?: string;
  initialOpen?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, shareableLink, initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Check if the dialog should be opened based on URL params
  useEffect(() => {
    const currentId = searchParams.get('id');
    const currentSlug = searchParams.get('slug');
    
    if ((currentId && currentId === project.id) || (currentSlug && currentSlug === project.slug)) {
      setIsOpen(true);
    }
  }, [searchParams, project.id, project.slug]);

  // Create a plain text version of the HTML description
  const truncateDescription = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > 100 ? text.slice(0, 100) + '...' : text;
  };

  const truncatedDescription = truncateDescription(project.description);
  
  // Format button link for external navigation
  const getButtonLink = () => {
    if (!project.buttonLink) return '#';
    
    if (project.buttonLink.startsWith('/')) {
      return project.buttonLink;
    }
    
    if (project.buttonLink.startsWith('http://') || project.buttonLink.startsWith('https://')) {
      return project.buttonLink;
    }
    
    return `https://${project.buttonLink}`;
  };

  const buttonLink = getButtonLink();

  // Get the icon component from Lucide icons
  const getIconComponent = () => {
    if (!project.icon) return ExternalLink;
    
    const IconComponent = LucideIcons[project.icon as keyof typeof LucideIcons] as React.ElementType;
    return IconComponent || ExternalLink;
  };

  const IconComponent = getIconComponent();

  // Handle project sharing
  const handleShare = async () => {
    try {
      const projectIdentifier = project.slug || project.id;
      const fullUrl = `${window.location.origin}/projects?${project.slug ? 'slug=' : 'id='}${projectIdentifier}`;
      
      if (navigator.share) {
        await navigator.share({
          title: project.name,
          text: truncatedDescription,
          url: fullUrl
        });
      } else {
        await navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share project');
    }
  };

  // Navigate to project detail page
  const handleDetailView = () => {
    const projectIdentifier = project.slug || project.id;
    router.push(`/projects/${projectIdentifier}`);
  };

  // Handle opening dialog without URL change
  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <GlassCard className="w-full h-full flex flex-col overflow-hidden shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
        <div 
          className="relative h-44 sm:h-52 w-full flex-shrink-0 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={project.coverPhoto || '/placeholder-image.jpg'}
            alt={project.name}
            layout="fill"
            objectFit="cover"
            className={`rounded-t-xl transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="p-4 sm:p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              {project.name}
            </h3>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="text-gray-400 hover:text-purple-400 transition-colors"
                aria-label="Share project"
              >
                <Share2 className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsLiked(!isLiked)}
                className={`transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                aria-label="Like project"
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500' : ''}`} />
              </motion.button>
            </div>
          </div>
          
          <p className="text-gray-300 mb-4 line-clamp-3 text-sm">{truncatedDescription}</p>
          
          <Button 
            variant="link" 
            onClick={handleOpenDialog} 
            className="p-0 h-auto font-semibold text-purple-400 hover:text-purple-300 self-start mb-4"
          >
            Read More
          </Button>
          
          <div className="mt-auto flex justify-between items-center">
            {project.buttonLink ? (
              <motion.a
                href={buttonLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full"
              >
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-full font-medium"
                >
                  {project.buttonType || 'View Project'}
                  {IconComponent && <IconComponent size={18} className="ml-2" />}
                </Button>
              </motion.a>
            ) : (
              <Button 
                onClick={handleDetailView}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-full font-medium"
              >
                View Details
                <ExternalLink size={18} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="w-[95%] max-w-[95%] sm:max-w-[700px] p-4 sm:p-6 bg-gray-900 text-white border border-purple-500/20 shadow-xl shadow-purple-500/10 max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-2 sm:mb-4">
              <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {project.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="relative h-40 sm:h-64 w-full my-2 sm:my-4">
              <Image
                src={project.coverPhoto || '/placeholder-image.jpg'}
                alt={project.name}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            
            <ScrollArea className="h-[30vh] sm:h-[40vh] mt-2 sm:mt-4 pr-2 sm:pr-4">
              <div 
                className="prose prose-sm sm:prose prose-invert max-w-none prose-headings:text-purple-300 prose-a:text-pink-400 prose-a:no-underline hover:prose-a:underline" 
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </ScrollArea>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:ml-auto">
                <Button 
                  onClick={handleShare}
                  variant="outline" 
                  className="border-gray-700 hover:bg-purple-900/30 hover:text-purple-300 transition-colors text-gray-400 bg-gray-800/50"
                >
                  <Share2 size={16} className="mr-2" />
                  Share
                </Button>
                
                {project.buttonLink && (
                  <a
                    href={buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-full"
                    >
                      {project.buttonType || 'Open Project'}
                      {IconComponent && <IconComponent size={18} className="ml-2" />}
                    </Button>
                  </a>
                )}
                
                <DialogClose asChild>
                  <Button variant="outline" className="border-gray-700 hover:bg-red-800/30 hover:text-red-300 transition-colors text-gray-400 bg-red-900/30">
                    Close
                  </Button>
                </DialogClose>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </GlassCard>
    </motion.div>
  );
};

export default ProjectCard;