import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Project } from '../types';
import GlassCard from './Glasscard';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProjectCardProps {
  project: Project;
}

const MAX_DESCRIPTION_LENGTH = 100;

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [isOpen, setIsOpen] = useState(false);

  const truncatedDescription = project.description.length > MAX_DESCRIPTION_LENGTH
    ? `${project.description.slice(0, MAX_DESCRIPTION_LENGTH)}...`
    : project.description;

  // Type assertion to ensure IconComponent is a valid React component
  const IconComponent = LucideIcons[project.icon as keyof typeof LucideIcons] as React.ElementType;

  return (
    <GlassCard className="w-full max-w-sm mx-auto">
      <div className="relative h-48 w-full">
        <Image
          src={project.coverPhoto || '/placeholder-image.jpg'}
          alt={project.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-xl"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
        <p className="text-gray-300 mb-4">{truncatedDescription}</p>
        {project.description.length > MAX_DESCRIPTION_LENGTH && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto font-semibold text-purple-400 hover:text-purple-300">
                Read More
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{project.name}</DialogTitle>
                <DialogDescription>{project.description}</DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
        <div className="mt-4 flex justify-between items-center">
          <motion.a
            href={project.buttonLink}
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
    </GlassCard>
  );
};

export default ProjectCard;