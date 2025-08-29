import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
}

export const ChatButton = ({ onClick }: ChatButtonProps) => {
  const buttonVariants = {
    initial: { scale: 1 },
    pulse: { 
      scale: [1, 1.1, 1], 
      boxShadow: [
        "0 0 0 0 rgba(99, 102, 241, 0)",
        "0 0 0 10px rgba(99, 102, 241, 0.3)",
        "0 0 0 0 rgba(99, 102, 241, 0)"
      ],
      transition: { 
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1
      }
    },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl z-40 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 border-2 border-white/10"
      initial="initial"
      animate="pulse"
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
    >
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 0.8, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6 md:w-7 md:h-7 text-white" />
          <motion.span 
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
      
      {/* Tooltip for desktop */}
      <motion.div
        className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none hidden md:block"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        Chat with Hira
        <div className="absolute top-1/2 -right-1 w-2 h-2 bg-gray-900 rotate-45 transform -translate-y-1/2" />
      </motion.div>
    </motion.button>
  );
};