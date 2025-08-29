'use client'
import React, { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export type AnimationType = 'fade' | 'slide' | 'scale';

interface SectionTransitionProps {
  children: ReactNode;
  activeSection: string;
  transitionDuration?: number;
  animationType?: AnimationType;
  isLoading?: boolean;
  className?: string;
}

const SectionTransition: React.FC<SectionTransitionProps> = ({
  children,
  activeSection,
  transitionDuration = 0.6,
  animationType = 'fade',
  isLoading = false,
  className = ''
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousSection, setPreviousSection] = useState<string>('');

  useEffect(() => {
    if (previousSection && previousSection !== activeSection) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, transitionDuration * 1000);
      
      return () => clearTimeout(timer);
    }
    setPreviousSection(activeSection);
  }, [activeSection, previousSection, transitionDuration]);

  // Animation variants for different transition types
  const fadeVariants: Variants = {
    initial: { 
      opacity: 0,
      filter: 'blur(4px)'
    },
    animate: { 
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: transitionDuration,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0,
      filter: 'blur(4px)',
      transition: {
        duration: transitionDuration * 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const slideVariants: Variants = {
    initial: { 
      opacity: 0,
      x: 50,
      filter: 'blur(2px)'
    },
    animate: { 
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: transitionDuration,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0,
      x: -50,
      filter: 'blur(2px)',
      transition: {
        duration: transitionDuration * 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const scaleVariants: Variants = {
    initial: { 
      opacity: 0,
      scale: 0.95,
      filter: 'blur(2px)'
    },
    animate: { 
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: transitionDuration,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0,
      scale: 1.05,
      filter: 'blur(2px)',
      transition: {
        duration: transitionDuration * 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  // Select animation variants based on type
  const getVariants = (): Variants => {
    switch (animationType) {
      case 'slide':
        return slideVariants;
      case 'scale':
        return scaleVariants;
      case 'fade':
      default:
        return fadeVariants;
    }
  };

  // Loading state component
  const LoadingOverlay = () => (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          className="text-gray-300 text-sm font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading section...
        </motion.p>
      </div>
    </motion.div>
  );

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingOverlay key="loading" />}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          variants={getVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {/* Transition indicator */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-500/30">
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-3 h-3 bg-purple-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <span className="text-gray-300 text-xs font-medium capitalize">
                  {activeSection}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SectionTransition;