import React from 'react';
import { motion } from 'framer-motion';

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; gradient?: string }> = ({ 
  children, 
  className = '', 
  gradient = 'from-purple-400/10 to-pink-600/10' 
}) => (
  <motion.div
    whileHover={{ 
      boxShadow: "0 0 20px rgba(123, 31, 162, 0.5)",
      transition: { duration: 0.3 }
    }}
    className={`
      bg-gradient-to-br ${gradient} 
      backdrop-filter backdrop-blur-lg 
      rounded-xl overflow-hidden 
      shadow-lg transition-all duration-300
      ${className}
    `}
  >
    <div className="absolute inset-0 bg-gradient-to-br ${gradient} opacity-20"></div>
    <motion.div 
      className="relative p-6 h-full z-10"
      whileHover={{ 
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-pink-600/0 opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
  </motion.div>
);
export default GlassCard;