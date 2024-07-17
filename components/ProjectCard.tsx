import React, { useState } from 'react';
import Image from 'next/image';
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
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [isOpen, setIsOpen] = useState(false);

  const truncateDescription = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    const firstLine = text.split('\n')[0];
    return firstLine.length > 50 ? firstLine.slice(0, 50) + '...' : firstLine;
  };

  const truncatedDescription = truncateDescription(project.description);
  const buttonLink = project.buttonLink.startsWith('http') ? project.buttonLink : `https://${project.buttonLink}`;

  // Type assertion to ensure IconComponent is a valid React component
  const IconComponent = LucideIcons[project.icon as keyof typeof LucideIcons] as React.ElementType;

  return (
    <GlassCard className="w-full h-[400px] flex flex-col">
      <div className="relative h-48 w-full flex-shrink-0">
        <Image
          src={project.coverPhoto || '/placeholder-image.jpg'}
          alt={project.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-xl"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
        <p className="text-gray-300 mb-2">{truncatedDescription}</p>
        <Button 
          variant="link" 
          onClick={() => setIsOpen(true)} 
          className="p-0 h-auto font-semibold text-purple-400 hover:text-purple-300 self-start"
        >
          Read More
        </Button>
        <div className="mt-auto flex justify-between items-center">
          <motion.a
            href={buttonLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full"
            >
              {project.buttonType}
              {IconComponent && <IconComponent size={24} className="ml-2" />}
            </Button>
          </motion.a>
        </div>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[625px] bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{project.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4">
            <div 
              className="prose prose-invert max-w-none" 
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </GlassCard>
  );
};

export default ProjectCard;