"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { HashLoader } from 'react-spinners';

const Loader: React.FC = () => {
  return (
    <motion.div 
      className="fixed inset-0 flex flex-col justify-center items-center bg-black/50 backdrop-blur-sm z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <HashLoader color="#ffffff" size={50} />
      </motion.div>
      <motion.p 
        className="mt-4 text-white/80 text-sm font-medium"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        Loading amazing content...
      </motion.p>
      
      {/* Loading progress bar */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ 
          scaleX: 1, 
          opacity: 1,
          transition: { 
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity
          }
        }}
        style={{ transformOrigin: "0%" }}
      />
    </motion.div>
  );
};

export default Loader;