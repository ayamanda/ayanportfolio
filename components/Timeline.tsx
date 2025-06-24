import React from 'react';
import { motion } from 'framer-motion';
import { Experience } from '@/types';
import Image from 'next/image';
import { BriefcaseIcon, CalendarIcon, MapPinIcon } from 'lucide-react';

interface TimelineProps {
  experiences: Experience[];
}

export const Timeline: React.FC<TimelineProps> = ({ experiences }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Vertical line with responsive positioning */}
      <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/50 via-indigo-500/50 to-transparent" />

      {experiences.map((experience, index) => (
        <motion.div
          key={experience.id}
          variants={itemVariants}
          className="relative pl-12 sm:pl-20 pb-8 sm:pb-10 last:pb-0"
        >
          {/* Timeline dot with responsive positioning */}
          <div className="absolute left-3 sm:left-7 w-3 h-3 rounded-full bg-purple-500 border-4 border-gray-900 -translate-x-1/2" />

          <div className="bg-gray-800/30 rounded-xl p-4 sm:p-6 border border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start space-x-4">
                {experience.companyLogo && (
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-gray-700/50 flex-shrink-0">
                    <Image
                      src={experience.companyLogo}
                      alt={experience.company}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    {experience.title}
                  </h3>
                  <p className="text-purple-400 font-medium">{experience.company}</p>
                  
                  <div className="mt-2 flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <CalendarIcon size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {experience.startDate} - {experience.endDate || 'Present'}
                      </span>
                    </div>
                    {experience.location && (
                      <div className="flex items-center">
                        <MapPinIcon size={14} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{experience.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-300 line-clamp-3 hover:line-clamp-none transition-all">
              {experience.description}
            </p>

            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
              {experience.technologies.map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="bg-purple-900/30 text-purple-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}; 