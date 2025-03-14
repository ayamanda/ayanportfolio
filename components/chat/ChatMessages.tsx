import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  toggleFeedback: (messageId: string, isHelpful: boolean) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatMessages({ messages, isLoading, toggleFeedback, messagesEndRef }: ChatMessagesProps) {
  return (
    <ScrollArea className="flex-1 px-4 py-2 overflow-y-auto">
      <div className="space-y-4 pb-2">
        {messages.map((message, index) => (
          <motion.div 
            key={message.id} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col max-w-[85%] gap-1">
              <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`p-3 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700/50'
                }`}>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              
              {message.role === 'assistant' && index > 0 && (
                <div className="flex items-center gap-2 px-2">
                  <button
                    onClick={() => toggleFeedback(message.id, true)}
                    className={`p-1 rounded-full ${message.feedback?.helpful === true ? 'text-green-500' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => toggleFeedback(message.id, false)}
                    className={`p-1 rounded-full ${message.feedback?.helpful === false ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 p-3 rounded-xl flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 bg-indigo-500 rounded-full"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}