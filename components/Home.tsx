import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Code, Briefcase, Clock, ExternalLink, ChevronLeft, ChevronRight, Award, Star } from 'lucide-react';
import { createApi } from 'unsplash-js';
import { Project } from '../types';
import { TextGenerateEffect } from './ui/text-generate-effect';
import GlassCard from './Glasscard';

// Unsplash API setup
const unsplashApi = createApi({
  accessKey: 'Sf2m7kvtEdL-4s8h5-m1O8oMRN6naG1CuMzc2buOBBY'
});

interface HomeProps {
  name: string;
  about: string;
  skills: string[];
  featuredProject: Project | null;
  numberOfProjects: number;
  experienceYears: number;
}

type UnsplashPhoto = {
  id: string;
  urls: { regular: string };
  user: {
    username: string;
    name: string;
  };
};

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="bg-purple-700/30 text-purple-100 px-2 py-1 rounded-full text-xs font-medium mr-2 mb-2 inline-block backdrop-blur-sm">
    {children}
  </span>
);

const GradientText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 ${className}`}>
    {children}
  </span>
);

const Carousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);

  useEffect(() => {
    unsplashApi.search
      .getPhotos({ query: 'technology', orientation: 'landscape', perPage: 3 })
      .then(result => {
        if (result.errors) {
          console.log('Error fetching Unsplash photos:', result.errors[0]);
        } else {
          setPhotos(result.response?.results || []);
        }
      })
      .catch(() => {
        console.log('Something went wrong with Unsplash API!');
      });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (photos.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-lg">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          className="absolute w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: index === currentIndex ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image src={photo.urls.regular} alt={`Project image ${index + 1}`} layout="fill" objectFit="cover" />
          <a
            className="absolute bottom-2 right-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://unsplash.com/@${photo.user.username}`}
          >
            {photo.user.name}
          </a>
        </motion.div>
      ))}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {photos.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-400'}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
      <button
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1"
        onClick={() => goToSlide((currentIndex - 1 + photos.length) % photos.length)}
      >
        <ChevronLeft className="text-white" size={20} />
      </button>
      <button
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1"
        onClick={() => goToSlide((currentIndex + 1) % photos.length)}
      >
        <ChevronRight className="text-white" size={20} />
      </button>
    </div>
  );
};

const Home: React.FC<HomeProps> = ({
  name,
  about,
  skills,
  featuredProject,
  numberOfProjects,
  experienceYears,
}) => {
  return (
    <section className="py-12 px-4  min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <GlassCard className="lg:col-span-2" gradient="from-blue-500/10 to-purple-600/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Hi, I'm <GradientText>{name}</GradientText>
            </h2>
            <p id='about'
              className="text-2xl leading-snug tracking-wide" 
            >
              <TextGenerateEffect words={about} />
            </p>


          </GlassCard>

          <GlassCard gradient="from-indigo-500/10 to-purple-600/10">
            <h3 className="text-xl font-bold mb-4 flex items-center text-white">
              <Code className="mr-2" size={24} /> <GradientText>Skills</GradientText>
            </h3>
            <div className="flex flex-wrap">
              {skills.map((skill, index) => (
                <Tag key={index}>{skill}</Tag>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="md:col-span-2" gradient="from-purple-500/10 to-pink-600/10">
            <h3 className="text-xl font-bold mb-4 text-white">
              <GradientText>Featured Project</GradientText>
            </h3>
            {featuredProject ? (
              <div className="flex items-center space-x-6">
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
                  <h4 className="text-lg font-semibold mb-2 text-white">{featuredProject.name}</h4>
                  <p className="text-gray-300 text-sm mb-3">{featuredProject.description}</p>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={featuredProject.buttonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-purple-700/50 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-purple-800/50 transition-colors backdrop-blur-sm"
                  >
                    View Project <ExternalLink size={16} className="ml-2" />
                  </motion.a>
                </div>
              </div>
            ) : (
              <p className="text-gray-300 text-sm">No featured project available.</p>
            )}
          </GlassCard>

          <GlassCard className="flex flex-col justify-between" gradient="from-yellow-500/10 to-orange-600/10">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center text-white">
                <Briefcase className="mr-2" size={24} /> <GradientText>Projects</GradientText>
              </h3>
              <p className="text-sm text-gray-300">Completed projects</p>
            </div>
            <p className="text-4xl font-bold text-white mt-4">{numberOfProjects}</p>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between" gradient="from-green-500/10 to-emerald-600/10">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center text-white">
                <Clock className="mr-2" size={24} /> <GradientText>Experience</GradientText>
              </h3>
              <p className="text-sm text-gray-300">Years in the field</p>
            </div>
            <div className="mt-4">
              <p className="text-4xl font-bold text-white">{experienceYears}</p>
              <div className="flex items-center mt-2">
                <Award className="text-yellow-400 mr-2" size={20} />
                <p className="text-sm text-gray-300">Senior Developer</p>
              </div>
              <div className="flex items-center mt-1">
                <Star className="text-yellow-400 mr-2" size={20} />
                <p className="text-sm text-gray-300">Top-rated freelancer</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="md:col-span-2 lg:col-span-1" gradient="from-blue-500/10 to-teal-600/10">
            <h3 className="text-xl font-bold mb-4 text-white">
              <GradientText>Project Showcase</GradientText>
            </h3>
            <Carousel />
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

export default Home;