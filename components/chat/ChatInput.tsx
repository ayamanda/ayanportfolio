import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Mic, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  autoResizeTextarea: () => void;
  isMobile: boolean;
}

const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

export function ChatInput({
  input,
  setInput,
  isLoading,
  handleSubmit,
  handleKeyDown,
  inputRef,
  autoResizeTextarea,
  isMobile
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Handle mobile keyboard visibility
  useEffect(() => {
    if (!isMobile) return;

    const handleResize = () => {
      const isKeyboardVisible = window.visualViewport?.height !== window.innerHeight;
      setKeyboardVisible(isKeyboardVisible);
      
      // Update input position when keyboard appears
      if (isKeyboardVisible && inputRef.current) {
        const viewportBottom = window.visualViewport?.height || window.innerHeight;
        const inputBottom = inputRef.current.getBoundingClientRect().bottom;
        if (inputBottom > viewportBottom) {
          inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, [isMobile, inputRef]);

  return (
    <div className={`
      border-t border-gray-800/50 p-4 bg-gray-900/95 backdrop-blur-md
      ${isMobile ? 'sticky bottom-0 pb-safe-bottom' : ''}
      ${keyboardVisible && isMobile ? 'pb-2' : ''}
    `}>
      <form onSubmit={handleSubmit} className="relative">
        <motion.div 
          className={`relative rounded-xl overflow-hidden border transition-all ${
            isFocused 
              ? 'border-violet-500/50 shadow-lg shadow-violet-500/10' 
              : 'border-gray-700/50'
          }`}
          animate={{ 
            scale: isFocused ? 1.01 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResizeTextarea();
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            className={`
              w-full bg-gradient-to-b from-gray-800 to-gray-900 text-white rounded-xl pl-4 pr-24 py-3 
              focus:outline-none resize-none
              ${isMobile ? 'text-base' : 'text-sm'}
            `}
            style={{ 
              maxHeight: isMobile ? '80px' : '120px',
              minHeight: isMobile ? '50px' : '40px'
            }}
            disabled={isLoading}
          />
          
          <div className="absolute right-2 bottom-2 flex gap-2">
            {input && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors duration-200"
                onClick={() => setInput('')}
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
            
            <motion.button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`
                ${isLoading || !input.trim() 
                  ? 'bg-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20'
                } 
                p-2 rounded-lg transition-all duration-300
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </motion.div>
        
        {!isMobile && (
          <motion.p 
            className="text-xs text-gray-400 mt-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Powered by AI • Enter to send
          </motion.p>
        )}
      </form>
    </div>
  );
}