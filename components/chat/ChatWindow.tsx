import { Button } from "@/components/ui/button";
import { X, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Message as MessageType } from '@/types';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { RefObject } from 'react';

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
  renderSuggestedQuestions
}: ChatWindowProps) => {
  return (
    <motion.div 
      className="fixed bottom-6 right-6 w-96 rounded-2xl shadow-xl z-30 overflow-hidden border border-gray-700 flex flex-col bg-gray-900"
      style={{ height: `${height}px` }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-indigo-800 to-purple-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-medium bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
            Chat with Hira
          </h3>
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
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatMessages 
          messages={messages} 
          isLoading={isLoading} 
          toggleFeedback={toggleFeedback}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {renderSuggestedQuestions()}

      <ChatInput 
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        handleSubmit={handleSubmit}
        handleKeyDown={handleKeyDown}
        inputRef={inputRef}
        autoResizeTextarea={autoResizeTextarea}
      />
    </motion.div>
  );
};