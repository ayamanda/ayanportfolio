import { Button } from "@/components/ui/button";
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message as MessageType } from '@/types';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { RefObject, useEffect } from 'react';

interface ChatWindowProps {
  height: number;
  messages: MessageType[];
  isLoading: boolean;
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  toggleFeedback: (messageId: string, isHelpful: boolean) => Promise<void>;
  endChatSession: () => void;
  setMode: (mode: 'minimized' | 'open') => void;
  messagesEndRef: RefObject<HTMLDivElement>;
  inputRef: RefObject<HTMLTextAreaElement>;
  autoResizeTextarea: () => void;
  renderSuggestedQuestions: () => JSX.Element | null;
  isMobile: boolean;
}

export const ChatWindow = ({
  height,
  messages,
  isLoading,
  input,
  setInput,
  handleSubmit,
  handleKeyDown,
  toggleFeedback,
  endChatSession,
  setMode,
  messagesEndRef,
  inputRef,
  autoResizeTextarea,
  renderSuggestedQuestions,
  isMobile
}: ChatWindowProps) => {
  // Prevent background scrolling when chat is open on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [isMobile]);

  return (
    <AnimatePresence>
      {/* Backdrop overlay for mobile */}
      {isMobile && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      
      <motion.div 
        className={`
          fixed z-50 flex flex-col
          ${isMobile 
            ? 'inset-x-0 bottom-0 top-0 h-[100dvh]' 
            : 'bottom-6 right-6 w-96 rounded-2xl shadow-xl border border-gray-700'
          }
          bg-gradient-to-b from-gray-900 to-gray-950
        `}
        style={!isMobile ? { height: `${height}px` } : undefined}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Sticky Header */}
        <motion.div 
          className={`
            sticky top-0 z-10
            flex items-center justify-between p-4
            bg-gradient-to-r from-indigo-800 to-purple-800
            border-b border-gray-800
            ${isMobile ? 'shadow-lg' : ''}
            ${isMobile ? 'rounded-none' : 'rounded-t-2xl'}
          `}
          initial={false}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <motion.h3 
              className="font-medium text-lg bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Chat with Hira
            </motion.h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              endChatSession();
              setMode('minimized');
            }}
            className="text-gray-200 hover:text-white hover:bg-purple-700/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0">
            <ChatMessages 
              messages={messages} 
              isLoading={isLoading} 
              toggleFeedback={toggleFeedback}
              messagesEndRef={messagesEndRef}
              isMobile={isMobile}
            />
          </div>
        </div>

        {/* Suggested Questions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {renderSuggestedQuestions()}
        </motion.div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`
            sticky bottom-0 w-full
            ${isMobile ? 'shadow-lg' : ''}
          `}
        >
          <ChatInput 
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
            handleKeyDown={handleKeyDown}
            inputRef={inputRef}
            autoResizeTextarea={autoResizeTextarea}
            isMobile={isMobile}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};