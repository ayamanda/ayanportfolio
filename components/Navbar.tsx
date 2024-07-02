import React from 'react';
import { motion } from 'framer-motion';
import { Home, Presentation, MessageCircle } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isSticky: boolean;
}



const Navbar: React.FC<NavbarProps> = ({ activeSection, setActiveSection, isSticky }) => {
  const sections = [
    { name: 'home', icon: Home },
    { name: 'projects', icon: Presentation },
    { name: 'contact', icon: MessageCircle }
  ];

  return (
    <motion.nav
      className={`w-full transition-all duration-300 ${
        isSticky 
          ? 'fixed top-0 left-0 right-0 z-50'
          : 'relative'
      }`}
      initial={false}
      animate={isSticky ? { y: 0 } : { y: 0 }}
    >
      <div
        className={`
          backdrop-filter backdrop-blur-lg
          ${isSticky 
            ? 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 rounded-full bg-gray-800/30 backdrop-blur-md border border-blue-100/20 shadow-lg'
            : 'bg-transparent'
          }
        `}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-4 py-4">
            {sections.map((section) => (
              <motion.button
                key={section.name}
                onClick={() => setActiveSection(section.name)}
                className={`relative px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ease-in-out
                  ${
                    activeSection === section.name
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  <section.icon className="mr-2" />
                  <span className="hidden sm:inline">
                    {section.name.charAt(0).toUpperCase() + section.name.slice(1)}
                  </span>
                </span>
                {activeSection === section.name && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-purple-600"
                    layoutId="activeBackground"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;