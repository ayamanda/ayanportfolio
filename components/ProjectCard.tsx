import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <motion.div
      className="glassmorphism rounded-2xl overflow-hidden"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Image
        src={project.coverPhoto || '/placeholder-image.jpg'}
        alt={project.name}
        width={400}
        height={250}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
        <p className="text-gray-300 mb-4">{project.description}</p>
        <motion.a
          href={project.buttonLink}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-semibold"
        >
          View Project <ExternalLink size={16} className="ml-2" />
        </motion.a>
      </div>
    </motion.div>
  );
};

export default ProjectCard;