import React from 'react';
import Image from 'next/image';
import { Linkedin, Dribbble, Twitter, Instagram, Code, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  name: string;
  title: string;
  photoURL: string;
}

const Header: React.FC<HeaderProps> = ({ name, title, photoURL }) => {
  return (
    <header className="h-screen flex flex-col justify-center items-center relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900 to-gray-900 opacity-50"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 relative z-10"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="relative w-48 h-48 flex-shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-75 animate-pulse" />
          <Image
            src={photoURL}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="rounded-full border-4 border-white shadow-lg relative z-10"
          />
        </motion.div>
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-7xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 z-10"
      >
        {name}
      </motion.h1>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-4xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 z-10"
      >
        {title}
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex space-x-6 z-10"
      >
        {[Linkedin, Dribbble, Twitter, Instagram].map((Icon, index) => (
          <motion.a
            key={index}
            href="#"
            className="text-white hover:text-indigo-300 transition-colors"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icon size={32} />
          </motion.a>
        ))}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-12 flex space-x-6"
      >
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-white text-lg font-semibold"
        >
          Scroll Down to Explore
        </motion.div>
      </motion.div>

      {/* Floating elements */}
      {['</', '{}', '[]', '//'].map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-3xl text-indigo-300 opacity-20"
          initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
        >
          {item}
        </motion.div>
      ))}
    </header>
  );
};

export default Header;