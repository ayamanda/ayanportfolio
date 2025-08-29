import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Presentation, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionName } from '@/hooks/useSectionTransition';

interface NavbarProps {
  activeSection: SectionName;
  setActiveSection: (section: SectionName) => void;
  isSticky: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ activeSection, setActiveSection, isSticky }) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const navRef = useRef<HTMLElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const sections: { name: SectionName; icon: any; label: string }[] = [
    { name: 'home', icon: Home, label: 'Home' },
    { name: 'projects', icon: Presentation, label: 'Projects' },
    { name: 'contact', icon: MessageCircle, label: 'Contact' }
  ];

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!navRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : sections.length - 1;
          setFocusedIndex(prevIndex);
          buttonRefs.current[prevIndex]?.focus();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = focusedIndex < sections.length - 1 ? focusedIndex + 1 : 0;
          setFocusedIndex(nextIndex);
          buttonRefs.current[nextIndex]?.focus();
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          buttonRefs.current[0]?.focus();
          break;
        case 'End':
          e.preventDefault();
          const lastIndex = sections.length - 1;
          setFocusedIndex(lastIndex);
          buttonRefs.current[lastIndex]?.focus();
          break;

      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, sections.length]);

  const handleSectionClick = (sectionName: SectionName, index: number) => {
    setActiveSection(sectionName);
    setFocusedIndex(index);
  };

  return (
    <motion.nav
      ref={navRef}
      className={cn(
        "w-full transition-all duration-500 z-50",
        isSticky
          ? "fixed top-0 left-0 right-0 py-3 sm:py-4"
          : "relative py-4 sm:py-6"
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      role="navigation"
      aria-label="Main navigation"
    >
      <motion.div
        className={cn(
          "mx-auto max-w-fit px-2 sm:px-1",
          isSticky && [
            "backdrop-blur-xl bg-slate-900/30 border border-white/20",
            "shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-2xl sm:rounded-full"
          ]
        )}
        animate={isSticky ? {
          scale: 0.95,
          y: 8
        } : {
          scale: 1,
          y: 0
        }}
        transition={{
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {/* Desktop Navigation */}
        <div className="flex justify-center items-center space-x-2 sm:space-x-1 p-3 sm:p-2">
          {sections.map((section, index) => (
            <motion.button
              key={section.name}
              ref={el => { buttonRefs.current[index] = el; }}
              onClick={() => handleSectionClick(section.name, index)}
              onFocus={() => setFocusedIndex(index)}
              className={cn(
                "relative px-4 py-3 sm:px-4 sm:py-2.5 rounded-full text-sm font-medium",
                "transition-all duration-300 ease-out group min-w-0 flex-shrink-0",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                activeSection === section.name
                  ? "text-white"
                  : "text-gray-300 hover:text-white"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-current={activeSection === section.name ? 'page' : undefined}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-2">
                <section.icon className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden xs:inline sm:inline font-medium whitespace-nowrap">
                  {section.label}
                </span>
              </span>

              {/* Hover effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.6
                }}
              />

              {/* Active indicator */}
              {activeSection === section.name && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/90 via-indigo-500/90 to-purple-500/90 shadow-lg shadow-purple-500/25"
                  layoutId="activeBackground"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                >
                  {/* Gradient border */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/30 via-indigo-400/30 to-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>


      </motion.div>
    </motion.nav>
  );
};

export default Navbar;