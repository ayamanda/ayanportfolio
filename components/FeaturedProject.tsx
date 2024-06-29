import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Project } from '../types';

interface FeaturedProjectProps {
  project: Project;
}

const FeaturedProject: React.FC<FeaturedProjectProps> = ({ project }) => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Featured Project</h2>
        <motion.div
          className="glassmorphism rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <Image
                src={project.coverPhoto || '/placeholder-image.jpg'}
                alt={project.name}
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <h3 className="text-2xl font-semibold mb-4">{project.name}</h3>
              <p className="text-gray-300 mb-6">{project.description}</p>
              <div className="flex space-x-4">
                <motion.a
                  href={project.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center bg-purple-500 text-white px-4 py-2 rounded-full font-semibold"
                >
                  Live Demo <ExternalLink size={16} className="ml-2" />
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProject;