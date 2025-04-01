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
      className="fixed bottom-6 right-6 flex items-center justify-center w-16 h-16 rounded-full shadow-lg z-40 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300"
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
          <MessageSquare className="w-7 h-7 text-white" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white" />
        </div>
      </motion.div>
    </motion.button>
  );
};