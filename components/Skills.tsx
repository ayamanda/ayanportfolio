import React from 'react';
import { motion } from 'framer-motion';
import { Skill } from '../types';

interface SkillsProps {
  skills: Skill[];
}

const Skills: React.FC<SkillsProps> = ({ skills }) => {
  // Helper function to convert skill level to a number
  const getSkillLevelNumber = (level: Skill['level']): number => {
    if (typeof level === 'number') {
      return level;
    }
    // Map string levels to numbers if needed
    switch (level) {
      case 'beginner':
        return 25;
      case 'intermediate':
        return 50;
      case 'advanced':
        return 75;
      case 'expert':
        return 100;
      default:
        return 0; // Default value for undefined or unknown levels
    }
  };

  return (
    <section className="py-20 bg-gray-900 bg-opacity-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">My Skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              className="glassmorphism rounded-lg p-6 flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-20 h-20 mb-4 relative">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                  />
                  <motion.circle
                    className="text-purple-500"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    initial={{ strokeDasharray: '0 283' }}
                    animate={{ strokeDasharray: `${getSkillLevelNumber(skill.level) * 2.83} 283` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{getSkillLevelNumber(skill.level)}%</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center">{skill.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;