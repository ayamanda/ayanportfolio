import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Linkedin, Twitter, Instagram, ChevronDown, Github, Mail } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

interface HeaderProps {
  name: string;
  title: string;
  photoURL: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
    upwork?: string;
    email?: string;
  };
}

// Custom Upwork icon component
const UpworkIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="currentColor"
    className="text-white group-hover:text-indigo-200 transition-colors"
  >
    <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/>
  </svg>
);

const Header: React.FC<HeaderProps> = ({ 
  name, 
  title, 
  photoURL, 
  socialLinks 
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  // Configure all available social icons
  const socialIcons = [
    { Icon: Twitter, link: socialLinks.twitter, label: 'Twitter' },
    { Icon: Linkedin, link: socialLinks.linkedin, label: 'LinkedIn' },
    { Icon: Instagram, link: socialLinks.instagram, label: 'Instagram' },
    { Icon: Github, link: socialLinks.github, label: 'GitHub' },
    { Icon: UpworkIcon, link: socialLinks.upwork, label: 'Upwork' },
    { Icon: Mail, link: socialLinks.email ? `mailto:${socialLinks.email}` : undefined, label: 'Email' }
  ].filter(icon => icon.link);
  
  // Split name for character animation
  const nameArray = name.split('');
  
  // Code-related particles
  const codeParticles = [
    '{ }', '</>', '()', '[]', 'if', 'for', '=>', '&&', '||', 
    '++', '===', '!==', 'let', 'const', 'async', 'await'
  ];

  return (
    <motion.header 
      ref={headerRef}
      className="h-screen flex flex-col justify-center items-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Darker gradient background with subtle animation */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-violet-950 to-slate-950"
        animate={{
          background: [
            'radial-gradient(ellipse at center, rgba(67, 56, 202, 0.1) 0%, rgba(30, 27, 75, 0.25) 50%, rgba(2, 6, 23, 0.95) 100%)',
            'radial-gradient(ellipse at center, rgba(109, 40, 217, 0.1) 0%, rgba(76, 29, 149, 0.25) 50%, rgba(2, 6, 23, 0.95) 100%)',
            'radial-gradient(ellipse at center, rgba(67, 56, 202, 0.1) 0%, rgba(30, 27, 75, 0.25) 50%, rgba(2, 6, 23, 0.95) 100%)'
          ]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Interactive grid pattern overlay with reduced opacity */}
      <div className="absolute inset-0 bg-grid-pattern opacity-8" />
      
      {/* Animated code particles with reduced visibility */}
      {codeParticles.map((item, index) => (
        <motion.div
          key={index}
          className="absolute font-mono text-sm md:text-base text-indigo-400/40 opacity-0 select-none pointer-events-none"
          style={{
            left: `${Math.random() * 90 + 5}%`,
            top: `${Math.random() * 90 + 5}%`,
            textShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
          }}
          initial={{ opacity: 0 }}
          animate={{
            x: [
              Math.random() * 80 - 40,
              Math.random() * 80 - 40,
              Math.random() * 80 - 40
            ],
            y: [
              Math.random() * 80 - 40,
              Math.random() * 80 - 40,
              Math.random() * 80 - 40
            ],
            scale: [0.8, 1.2, 0.8],
            rotate: [0, Math.random() * 60 - 30, 0],
            opacity: [0, 0.25, 0]
          }}
          transition={{ 
            duration: 8 + Math.random() * 12, 
            repeat: Infinity, 
            delay: Math.random() * 5,
            ease: "easeInOut" 
          }}
        >
          {item}
        </motion.div>
      ))}
      
      {/* Subtle blur circles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl opacity-15"
            style={{
              background: i === 0 
                ? 'linear-gradient(to right, #4338ca, #7c3aed)' 
                : i === 1 
                  ? 'linear-gradient(to right, #6d28d9, #db2777)' 
                  : 'linear-gradient(to right, #2563eb, #059669)',
              width: 300 + i * 100,
              height: 300 + i * 100,
            }}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight
              ],
            }}
            transition={{
              duration: 25 + i * 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      

      <motion.div
        style={{ 
          opacity,
          scale
        }}
        className="mb-8 relative z-10"
      >
        <motion.div 
          className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Subtle glow ring */}
          <motion.div 
            className="absolute inset-0 rounded-full blur-md"
            style={{
              background: 'conic-gradient(from 0deg, #4338ca, #7c3aed, #db2777, #4338ca)',
              transform: 'scale(1.05)'
            }}
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ 
              duration: 12, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          
          {/* Photo container with simplified design */}
          <div className="absolute inset-0 z-10 rounded-full overflow-hidden border-2 border-indigo-400/30">
            <Image
              src={photoURL}
              alt={name}
              fill
              sizes="(max-width: 768px) 160px, 192px"
              className="object-cover rounded-full border-4 border-white/30 shadow-xl relative z-10"
              priority
            />
            
            {/* Subtle shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          </div>
        </motion.div>
      </motion.div>
      
      {/* Animated name with enhanced character-by-character reveal */}
      <motion.h1
        style={{ opacity }}
        className="text-4xl sm:text-5xl md:text-7xl font-bold mb-2 z-10 text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 0.2,
          duration: 0.5,
          type: "spring",
          stiffness: 100
        }}
        whileHover={{ 
          scale: 1.1, 
          color: '#a78bfa',
          transition: { duration: 0.2 }
        }}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-indigo-200 to-purple-200">
          {name}
        </span>
      </motion.h1>
      
      {/* Title with clean typing effect */}
      <motion.div
        style={{ opacity }}
        className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 z-10 text-center px-4 overflow-hidden"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-indigo-200 to-purple-200"
        >
          {title}
        </motion.h2>
        <motion.div 
          className="h-0.5 w-full bg-gradient-to-r from-indigo-300/0 via-purple-300 to-pink-300/0 mt-1"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.5 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        />
      </motion.div>
      
      {/* Social icons with refined interactive effects */}
      <motion.div
        style={{ opacity }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap justify-center gap-4 md:gap-6 z-10 px-4"
      >
        {socialIcons.map(({ Icon, link, label }, index) => (
          <motion.a
            key={index}
            href={link}
            aria-label={label}
            className="relative group"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* Icon container with subtle glow */}
            <motion.div
              className="p-3 rounded-full bg-slate-800/60 backdrop-blur-sm border border-indigo-500/20 shadow-lg"
              whileHover={{ 
                boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
                borderColor: "rgba(99, 102, 241, 0.4)"
              }}
            >
              <Icon 
                size={22} 
                className="text-white group-hover:text-indigo-200 transition-colors" 
              />
            </motion.div>
            
            {/* Simple tooltip */}
            <motion.span 
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              whileHover={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium bg-slate-800/90 text-white px-2 py-1 rounded-md whitespace-nowrap border border-indigo-500/10 backdrop-blur-sm"
            >
              {label}
            </motion.span>
          </motion.a>
        ))}
      </motion.div>
      
      {/* Improved scroll indicator */}
      <motion.div
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer z-10"
        onClick={() => window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        })}
      >
        <motion.div
          className="flex flex-col items-center"
          whileHover={{ y: 5 }}
        >
          <motion.div
            className="px-4 py-2 rounded-full bg-indigo-600/20 backdrop-blur-sm border border-indigo-500/30 flex items-center gap-2"
            whileHover={{ 
              backgroundColor: "rgba(79, 70, 229, 0.3)",
              boxShadow: "0 0 12px rgba(79, 70, 229, 0.3)" 
            }}
          >
            <motion.p 
              className="text-white text-sm font-medium"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Explore
            </motion.p>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="text-white" size={18} />
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Section fade transition at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent z-5" />
      
      {/* Add a CSS grid pattern */}
      <style jsx global>{`
        .bg-grid-pattern {
          background-size: 50px 50px;
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.07) 1px, transparent 1px);
          mask-image: radial-gradient(circle, white 20%, transparent 70%);
        }
      `}</style>
    </motion.header>
  );
};

export default Header;