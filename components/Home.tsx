import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Code, Briefcase, Clock, ExternalLink } from 'lucide-react';
import { Project } from '../types';

interface HomeProps {
  name: string;
  photoURL: string;
  about: string;
  skills: string[];
  featuredProject: Project | null;
  numberOfProjects: number;
  experienceYears: number;
}

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`bg-gray-800 rounded-xl p-4 shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium mr-2 mb-2 inline-block">
    {children}
  </span>
);

const Home: React.FC<HomeProps> = ({
  name,
  photoURL,
  about,
  skills,
  featuredProject,
  numberOfProjects,
  experienceYears
}) => {
  return (
    <section className="py-8 px-4 bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative w-32 h-32 flex-shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse" />
              <Image
                src={photoURL}
                alt={name}
                layout="fill"
                objectFit="cover"
                className="rounded-full border-2 border-white shadow-lg relative z-10"
              />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold mb-2 text-white">{name}</h2>
              <p className="text-gray-300 text-sm">{about}</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-purple-600">
            <h3 className="text-lg font-bold mb-3 flex items-center text-white">
              <Code className="mr-2" size={18} /> Skills
            </h3>
            <div className="flex flex-wrap">
              {skills.map((skill, index) => (
                <Tag key={index}>{skill}</Tag>
              ))}
            </div>
          </Card>

          <Card className="md:col-span-2">
            <h3 className="text-lg font-bold mb-3 text-white">Featured Project</h3>
            {featuredProject ? (
              <div className="flex items-center space-x-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={featuredProject.coverPhoto || '/placeholder-image.jpg'}
                    alt={featuredProject.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="text-md font-semibold mb-1 text-white">{featuredProject.name}</h4>
                  <p className="text-gray-300 text-sm mb-2">{featuredProject.description}</p>
                  <a
                    href={featuredProject.buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-purple-700 transition-colors"
                  >
                    View Project <ExternalLink size={12} className="ml-1" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 text-sm">No featured project available.</p>
            )}
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1 flex items-center text-white">
                <Briefcase className="mr-2" size={18} /> Projects
              </h3>
              <p className="text-sm text-white">Completed projects</p>
            </div>
            <p className="text-3xl font-bold text-white">{numberOfProjects}</p>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1 flex items-center text-white">
                <Clock className="mr-2" size={18} /> Experience
              </h3>
              <p className="text-sm text-white">Years of experience</p>
            </div>
            <p className="text-3xl font-bold text-white">{experienceYears}</p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Home;