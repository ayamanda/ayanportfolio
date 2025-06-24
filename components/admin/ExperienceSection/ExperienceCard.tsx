import React from 'react';
import Image from 'next/image';
import { Experience } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface ExperienceCardProps {
  experience: Experience;
  onEdit: () => void;
  onDelete: () => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {experience.companyLogo && (
            <div className="relative w-12 h-12 flex-shrink-0 bg-gray-700 rounded-lg">
              <Image
                src={experience.companyLogo}
                alt={experience.company}
                fill
                sizes="48px"
                className="rounded-lg object-cover"
                onError={(e) => {
                  // Hide the image on error and show a fallback background
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-white">{experience.title}</h3>
            <p className="text-purple-400">{experience.company}</p>
            <p className="text-gray-400 text-sm">{experience.location}</p>
            <p className="text-gray-400 text-sm">
              {experience.startDate} - {experience.endDate || 'Present'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 border-gray-700 text-gray-400 hover:text-white"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 border-gray-700 text-red-400 hover:text-red-300"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
      <p className="mt-3 text-gray-300 text-sm">{experience.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {experience.technologies.map((tech, index) => (
          <span
            key={index}
            className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded-full text-xs"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}; 