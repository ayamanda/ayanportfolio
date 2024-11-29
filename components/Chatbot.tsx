import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Loader2, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Profile, Project, Skill } from '../types';

interface ChatbotProps {
  profile: Profile;
  projects: Project[];
  skills: Skill[];
}

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const systemPrompt = (profile: Profile, projects: Project[], skills: Skill[]) => `
You are Hira, an AI assistant for ${profile.name}'s portfolio website. You are made by ${profile.name} .Here's the information about him:

Name: ${profile.name}
About: ${profile.about}

Skills: ${skills.map(skill => skill.name).join(', ')}

contact: email- ayanmandal059@gmail.com, phone- +91 8927081490

Projects: ${projects.map(project => `
- ${project.name}: ${project.description}
`).join('\n')}

Important Guidelines:
1. Keep responses concise, friendly, and professional
2. When discussing projects or skills, provide specific examples from the portfolio
3. If asked about topics not related to ${profile.name} or their work, politely decline to comment
4. Use the personal details to provide more contextual and relevant responses
5. Only give contact information if asked about it.
5. If asked about someone named "Ayan" or topics outside your knowledge scope, respond with: "I apologize, but I can only provide information about ${profile.name} and their portfolio. I don't have information about Ayan or other individuals."

Social Links:
- Twitter: ${profile.twitterURL}
- LinkedIn: ${profile.linkedinURL}
- Instagram: ${profile.instagramURL}

Keep responses concise and friendly. When discussing projects or skills, provide specific examples from the portfolio.
`;

const initialMessage: Message = {
  role: 'assistant',
  content: "👋 Hi! I'm Hira, your AI assistant. How can I help you today?",
};

export default function Chatbot({ profile, projects, skills }: ChatbotProps) {
  const [mode, setMode] = useState<'minimized' | 'floating' | 'fullscreen'>('minimized');
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMode(mode === 'fullscreen' ? 'floating' : mode);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt(profile, projects, skills) },
            ...messages,
            { role: 'user', content: userMessage }
          ]
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    if (mode === 'minimized') {
      setMode(window.innerWidth <= 768 ? 'fullscreen' : 'floating');
    } else {
      setMode('minimized');
    }
  };

  return (
    <>
      {/* Chat Button */}
      {mode === 'minimized' && (
        <motion.button
          className="fixed bottom-6 right-6 z-50 rounded-full bg-purple-600 p-4 text-white shadow-lg transition-colors hover:bg-purple-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleChat}
        >
          <MessageSquare size={24} />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {mode !== 'minimized' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`bg-gray-900 flex flex-col ${mode === 'fullscreen' ? 'fixed inset-0 z-50' : 'fixed bottom-6 right-6 z-50 w-[400px] rounded-lg shadow-xl max-h-[calc(100vh-6rem)]'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <div>
                  <h3 className="text-lg font-semibold text-white">Hira</h3>
                  <p className="text-sm text-gray-400">Ask me anything about Ayan </p>
              </div>
              <button
                onClick={toggleChat}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-gray-100 p-3 rounded-lg">
                    <Loader2 className="animate-spin" size={20} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-purple-600 text-white hover:bg-purple-700"
                >
                  <Send size={20} />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
