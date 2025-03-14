import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Project } from '@/types';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Share2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { toast } from 'react-toastify';

interface ProjectDetailProps {
  project: Project;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const router = useRouter();

  // Enhanced link handling for buttonLink
  const getButtonLink = () => {
    if (!project.buttonLink) return '#';
    
    // Check if it's an internal link (relative path)
    if (project.buttonLink.startsWith('/')) {
      return project.buttonLink;
    }
    
    // Check if it's already an absolute URL
    if (project.buttonLink.startsWith('http://') || project.buttonLink.startsWith('https://')) {
      return project.buttonLink;
    }
    
    // Default to adding https:// prefix
    return `https://${project.buttonLink}`;
  };

  const buttonLink = getButtonLink();

  // Type assertion to ensure IconComponent is a valid React component
  const getIconComponent = () => {
    if (!project.icon) return ExternalLink;
    
    // Check if the icon exists in LucideIcons
    const IconComponent = LucideIcons[project.icon as keyof typeof LucideIcons] as React.ElementType;
    return IconComponent || ExternalLink;
  };

  const IconComponent = getIconComponent();

  const handleShare = async () => {
    try {
      // Build the full URL for sharing
      const shareableLink = project.slug ? `/project/${project.slug}` : `/project/${project.id}`;
      const fullUrl = `${window.location.origin}${shareableLink}`;
      
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: project.name,
          text: "Check out this project: " + project.name,
          url: fullUrl
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share project');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          onClick={() => router.push('/projects')}
          variant="ghost"
          className="mb-6 flex items-center text-gray-300 hover:text-white"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Projects
        </Button>
        
        <div className="bg-gray-900 bg-opacity-60 rounded-2xl shadow-xl overflow-hidden border border-purple-500/10">
          <div className="relative h-64 sm:h-80 md:h-96 w-full">
            <Image
              src={project.coverPhoto || '/placeholder-image.jpg'}
              alt={project.name}
              layout="fill"
              objectFit="cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
          </div>
          
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              {project.name}
            </h1>
            
            <div className="prose prose-invert max-w-none prose-headings:text-purple-300 prose-a:text-pink-400 prose-a:no-underline hover:prose-a:underline mb-8" 
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              {project.buttonLink && (
                <motion.a
                  href={buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1"
                >
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-full font-medium"
                  >
                    {project.buttonType || 'Open Project'}
                    {IconComponent && <IconComponent size={18} className="ml-2" />}
                  </Button>
                </motion.a>
              )}
              
              <Button 
                onClick={handleShare}
                variant="outline" 
                className="border-gray-700 text-gray-300 hover:text-white"
              >
                <Share2 size={16} className="mr-2" />
                Share Project
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;