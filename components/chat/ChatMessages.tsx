import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  toggleFeedback: (messageId: string, isHelpful: boolean) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isMobile: boolean;
}

export function ChatMessages({ messages, isLoading, toggleFeedback, messagesEndRef, isMobile }: ChatMessagesProps) {
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    removed: { opacity: 0, x: 100 }
  };

  const typingIndicatorVariants = {
    initial: { width: 0 },
    animate: { 
      width: '100%', 
      transition: { 
        duration: 1.5,
        ease: "easeInOut", 
        repeat: Infinity,
        repeatType: "reverse" as const
      } 
    }
  };

  return (
    <TooltipProvider>
      <ScrollArea 
        className={`
          h-full w-full overflow-y-auto
          ${isMobile ? 'bg-transparent' : 'bg-gray-900/60 backdrop-blur-sm'}
        `}
      >
        <div className={`
          space-y-4 p-4 pb-6
          ${isMobile ? 'px-2 sm:px-4' : 'px-4'}
        `}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial="hidden"
                animate="visible"
                exit="removed"
                custom={index}
                variants={messageVariants}
                onHoverStart={() => setHoveredMessage(message.id)}
                onHoverEnd={() => setHoveredMessage(null)}
              >
                <div className={`
                  flex flex-col gap-1
                  ${message.role === 'user' ? 'max-w-[85%]' : 'max-w-[90%]'}
                  ${isMobile ? 'w-full sm:w-auto' : ''}
                `}>
                  <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {message.role === 'assistant' ? (
                      <motion.div 
                        className={`
                          flex-shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 
                          flex items-center justify-center shadow-lg shadow-violet-500/20
                          ${isMobile ? 'w-7 h-7' : 'w-8 h-8'}
                        `}
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Sparkles className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-white`} />
                      </motion.div>
                    ) : (
                      <motion.div 
                        className={`
                          flex-shrink-0 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 
                          flex items-center justify-center shadow-lg shadow-blue-500/20
                          ${isMobile ? 'w-7 h-7' : 'w-8 h-8'}
                        `}
                        whileHover={{ scale: 1.1 }}
                      >
                        <User className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-white`} />
                      </motion.div>
                    )}
                    <motion.div 
                      className={`
                        p-3 rounded-xl break-words drop-shadow-md
                        ${message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-blue-500/20'
                          : 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 border border-violet-500/20'
                        }
                        ${isMobile ? 'text-sm sm:text-base' : 'text-sm'}
                      `}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  </div>
                  
                  {message.role === 'assistant' && index > 0 && (
                    <motion.div 
                      className={`
                        flex items-center gap-2 px-2
                        ${isMobile ? 'opacity-100' : 'opacity-0'}
                      `}
                      animate={{ opacity: isMobile || hoveredMessage === message.id ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            onClick={() => toggleFeedback(message.id, true)}
                            className={`
                              p-1.5 rounded-full
                              ${message.feedback?.helpful === true 
                                ? 'bg-green-700/20 text-green-500' 
                                : 'text-gray-500 hover:text-green-400 hover:bg-green-700/10'
                              }
                              ${isMobile ? 'scale-90' : ''}
                            `}
                            whileHover={{ scale: isMobile ? 1.1 : 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">This was helpful</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            onClick={() => toggleFeedback(message.id, false)}
                            className={`
                              p-1.5 rounded-full
                              ${message.feedback?.helpful === false 
                                ? 'bg-red-700/20 text-red-500' 
                                : 'text-gray-500 hover:text-red-400 hover:bg-red-700/10'
                              }
                              ${isMobile ? 'scale-90' : ''}
                            `}
                            whileHover={{ scale: isMobile ? 1.1 : 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">This was not helpful</p>
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div 
              className="flex justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className={`
                bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-xl 
                flex items-center gap-2 border border-violet-500/20 
                shadow-lg shadow-violet-500/10
                ${isMobile ? 'p-3 text-sm' : 'p-4'}
              `}>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className={`
                        bg-violet-500 rounded-full
                        ${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'}
                      `}
                      animate={{ 
                        y: [0, -6, 0],
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5, 
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
                <motion.div className="h-0.5 w-16 bg-gray-700 overflow-hidden rounded-full">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    variants={typingIndicatorVariants}
                    initial="initial"
                    animate="animate"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
