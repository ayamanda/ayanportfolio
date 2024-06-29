import React from 'react';
import Image from 'next/image';
import { Linkedin, Dribbble, Twitter, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  name: string;
  title: string;
  photoURL: string;
}

const Header: React.FC<HeaderProps> = ({ name, title, photoURL }) => {
  return (
    <header className="bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 relative"
          >
            <div className="relative">
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
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
          >
            {name}
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
          >
            {title}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex space-x-6"
          >
            {[Linkedin, Dribbble, Twitter, Instagram].map((Icon, index) => (
              <motion.a
                key={index}
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon size={24} />
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Header;