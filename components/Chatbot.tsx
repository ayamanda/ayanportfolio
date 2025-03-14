import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Loader2, Send, Sparkles, ThumbsUp, ThumbsDown, MoreHorizontal, ArrowUp, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Profile, Project, Skill, Message as MessageType, ChatSession } from '../types';
import { doc, collection, addDoc, updateDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Drawer,
  DrawerContent
} from "@/components/ui/drawer";

interface ChatbotProps {
  profile: Profile;
  projects: Project[];
  skills: Skill[];
  userEmail?: string;
}

// Enhanced system prompt with more detailed information
const systemPrompt = (profile: Profile, projects: Project[], skills: Skill[]) => `
You are Hira, an AI assistant for ${profile.name}'s portfolio website. You are made by ${profile.name}. Here's the information about them:

Name: ${profile.name}
Title: ${profile.title || 'Developer'}
About: ${profile.about}

Skills: ${skills.map(skill => skill.name).join(', ')}

Contact: email- ${profile.email || 'ayanmandal059@gmail.com'}, phone- ${profile.phone || '+91 8927081490'}

Projects: ${projects.map(project => `
- ${project.name}: ${project.description}
  ${project.tags ? `Tags: ${project.tags.join(', ')}` : ''}
  ${project.link ? `Link: ${project.link}` : ''}
`).join('\n')}

Important Guidelines:
1. Keep responses concise, friendly, and professional
2. When discussing projects or skills, provide specific examples from the portfolio
3. If asked about topics not related to ${profile.name} or their work, politely decline to comment
4. Use personal details to provide more contextual and relevant responses
5. Only give contact information if asked about it
6. If asked about someone named "Ayan" or topics outside your knowledge scope, respond with: "I apologize, but I can only provide information about ${profile.name} and their portfolio. I don't have information about Ayan or other individuals."
7. Format code snippets with proper markdown syntax for highlighting
8. You may use markdown formatting in your responses for better readability

Social Links:
- Twitter: ${profile.twitterURL || ''}
- LinkedIn: ${profile.linkedinURL || ''}
- Instagram: ${profile.instagramURL || ''}
- GitHub: ${profile.githubURL || ''}

Keep responses concise and friendly. When discussing projects or skills, provide specific examples from the portfolio.
`;

// Initial greeting message
const initialMessage: MessageType = {
  id: uuidv4(),
  role: 'assistant',
  content: "👋 Hi! I'm Hira, your AI assistant. How can I help you learn more about this portfolio?",
  timestamp: Date.now(),
};

// Theme colors for the gradient effects
const themeColors = {
  primary: 'from-indigo-600 to-violet-600',
  primaryHover: 'from-indigo-500 to-violet-500',
  secondary: 'from-cyan-600 to-blue-600',
  accent: 'from-purple-600 to-pink-600',
  dark: 'bg-gray-900',
  darkSecondary: 'bg-gray-800',
  text: 'text-white',
  textSecondary: 'text-gray-300',
  border: 'border-gray-700'
};

export default function Chatbot({ profile, projects, skills, userEmail }: ChatbotProps) {
  const [mode, setMode] = useState<'minimized' | 'open'>('minimized');
  const [messages, setMessages] = useState<MessageType[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "What kind of projects have you worked on?",
    "What are your main skills?",
    "Tell me about your experience",
    "How can I contact you?"
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const [pulseButton, setPulseButton] = useState(true);
  
  // Initialize a chat session and retrieve previous messages if any
  const initChatSession = useCallback(async () => {
    try {
      // Check for existing sessions from this user first
      if (userEmail && userEmail !== 'anonymous') {
        const sessionsRef = collection(db, 'chatSessions');
        const q = query(
          sessionsRef, 
          where('userEmail', '==', userEmail),
          orderBy('startTime', 'desc'),
          // Limit to the most recent session
          // Firebase requires a .limit() after orderBy()
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Found an existing session, use the most recent one
          const recentSession = querySnapshot.docs[0];
          const sessionData = recentSession.data() as ChatSession;
          setSessionId(recentSession.id);
          
          // Fetch messages for this session
          const messagesRef = collection(db, 'messages');
          const messagesQuery = query(
            messagesRef,
            where('sessionId', '==', recentSession.id),
            orderBy('timestamp', 'asc')
          );
          
          const messagesSnapshot = await getDocs(messagesQuery);
          
          if (!messagesSnapshot.empty) {
            const loadedMessages = messagesSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: data.id,
                role: data.role,
                content: data.content,
                timestamp: data.timestamp?.toMillis() || Date.now(),
                feedback: data.feedback
              } as MessageType;
            });
            
            setMessages(loadedMessages);
            return recentSession.id;
          }
        }
      }
      
      // If no existing session or no messages found, create a new one
      // Get device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      };
      
      // Create a new session in Firebase
      const newSession: ChatSession = {
        id: uuidv4(),
        startTime: Date.now(),
        userEmail: userEmail || 'anonymous',
        messages: [],
        deviceInfo
      };
      
      const docRef = await addDoc(collection(db, 'chatSessions'), newSession);
      setSessionId(docRef.id);
      
      // Save initial message to the database
      await addDoc(collection(db, 'messages'), {
        ...initialMessage,
        sessionId: docRef.id,
        timestamp: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating/retrieving chat session:', error);
      return null;
    }
  }, [userEmail]);

  // Save a message to Firebase
  const saveMessageToFirebase = async (message: MessageType, chatSessionId: string) => {
    try {
      await addDoc(collection(db, 'messages'), {
        ...message,
        sessionId: chatSessionId,
        timestamp: serverTimestamp()
      });
      
      // Also update the session with the latest message
      const sessionRef = doc(db, 'chatSessions', chatSessionId);
      await updateDoc(sessionRef, {
        lastMessage: message.content,
        lastActivityTime: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  // Move endChatSession inside useCallback
  const endChatSession = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const sessionRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(sessionRef, {
        endTime: Date.now()
      });
    } catch (error) {
      console.error('Error ending chat session:', error);
    }
  }, [sessionId]); // Add sessionId as dependency

  // Toggle feedback on a message
  const toggleFeedback = async (messageId: string, isHelpful: boolean) => {
    try {
      // Update the message in local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                feedback: { helpful: isHelpful, timestamp: Date.now(), messageId }
              } 
            : msg
        )
      );
      
      // Update in Firebase
      if (sessionId) {
        const messagesRef = collection(db, 'messages');
        const q = query(messagesRef, where('id', '==', messageId), where('sessionId', '==', sessionId));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach(async (document) => {
          await updateDoc(doc(db, 'messages', document.id), {
            feedback: { helpful: isHelpful, timestamp: Date.now(), messageId }
          });
        });
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-resize text area based on content
  const autoResizeTextarea = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const newHeight = Math.min(inputRef.current.scrollHeight, 120); // Increased max height
      inputRef.current.style.height = `${newHeight}px`;
    }
  };

  // Keep button pulsing when minimized
  useEffect(() => {
    if (mode === 'minimized') {
      const pulseInterval = setInterval(() => {
        setPulseButton(prev => !prev);
      }, 3000);
      
      return () => clearInterval(pulseInterval);
    }
  }, [mode]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (mode === 'open') {
      setTimeout(() => {
        if (inputRef.current && !isMobile) {
          inputRef.current.focus();
        }
      }, 300);
    }
  }, [mode, isMobile]);

  // Initialize session when chat opens
  useEffect(() => {
    if (mode === 'open' && !sessionId) {
      initChatSession();
    }
  }, [mode, sessionId, initChatSession]);

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent, questionText?: string) => {
    e?.preventDefault();
    
    const userMessage = questionText || input.trim();
    if (!userMessage || isLoading) return;
    
    // Clear input and suggestions
    setInput('');
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    
    // Create and add user message
    const newUserMessage: MessageType = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    
    // Initialize session if needed
    let chatSessionId = sessionId;
    if (!chatSessionId) {
      chatSessionId = await initChatSession() || '';
      setSessionId(chatSessionId);
    }
    
    // Save message to Firebase
    await saveMessageToFirebase(newUserMessage, chatSessionId);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt(profile, projects, skills) },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      if (!data.message) {
        throw new Error('Invalid response format');
      }

      // Create and add assistant response
      const newAssistantMessage: MessageType = {
        id: uuidv4(),
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, newAssistantMessage]);
      
      // Save response to Firebase
      await saveMessageToFirebase(newAssistantMessage, chatSessionId);
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add more specific error message
      const errorMessage: MessageType = { 
        id: uuidv4(),
        role: 'assistant', 
        content: error instanceof Error 
          ? `I apologize, but I encountered an error: ${error.message}`
          : "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      await saveMessageToFirebase(errorMessage, chatSessionId);
      
    } finally {
      setIsLoading(false);
      
      // Focus input after sending message
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  // Update the toggleChat useCallback to include endChatSession in dependencies
  const toggleChat = useCallback(() => {
    if (mode === 'minimized') {
      setMode('open');
    } else {
      endChatSession();
      setMode('minimized');
    }
  }, [mode, endChatSession]); // Add endChatSession to dependencies
  
  // Handle keyboard interactions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Select a suggested question
  const handleSuggestedQuestion = (question: string) => {
    handleSubmit(undefined, question);
  };

  // Render suggested questions chips
  const renderSuggestedQuestions = () => {
    if (!showSuggestions || messages.length > 1) return null;
    
    return (
      <div className="px-4 py-3 space-y-2">
        <p className="text-xs text-gray-400 font-medium">Suggested questions:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((question, index) => (
            <motion.button
              key={index}
              onClick={() => handleSuggestedQuestion(question)}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors duration-200 whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {question}
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  // Rendering the chatbot UI
  const renderChatbot = () => {
    // Define common components
    const ChatHeader = () => (
      <motion.div 
        className="border-b border-gray-800 py-3 px-4 bg-gray-900 bg-opacity-95 backdrop-blur-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Hira</h3>
              <p className="text-xs text-gray-400">AI Assistant for {profile.name}</p>
            </div>
          </div>
          <button 
            onClick={toggleChat}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    );

    const DesktopChat = () => (
      <motion.div
        className="fixed bottom-6 right-6 z-50 w-[480px] h-[80vh] max-h-[800px] min-h-[400px] rounded-2xl shadow-2xl bg-gray-900 border border-gray-800 flex flex-col overflow-hidden"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <ChatHeader />
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-4 py-3">
            <div className="space-y-6" ref={chatContentRef}>
              {messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  toggleFeedback={toggleFeedback}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          {renderSuggestedQuestions()}
          
          <motion.div 
            className="p-3 border-t border-gray-800 bg-gray-900 bg-opacity-95 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <div className="relative flex-1 bg-gray-800 rounded-lg">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    autoResizeTextarea();
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="w-full bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500 py-3 px-4 max-h-[120px] resize-none text-sm"
                  style={{ height: '44px' }}
                  rows={1}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                className={`shrink-0 h-11 w-11 rounded-full p-0 bg-gradient-to-r ${themeColors.primary} hover:${themeColors.primaryHover} transition-all duration-200 flex items-center justify-center`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Send className="h-5 w-5 text-white" />
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    );

    // Return correct UI based on device type
    if (isMobile) {
      return (
        <Drawer open={mode === 'open'} onOpenChange={(open) => !open && toggleChat()}>
          <DrawerContent className="bg-gray-900 h-[90vh] max-h-[90vh] rounded-t-xl">
            <div className="flex flex-col h-full">
              <ChatHeader />
              
              <ScrollArea className="flex-1">
                <div className="px-4 py-3 space-y-6" ref={chatContentRef}>
                  {messages.map((message) => (
                    <MessageBubble 
                      key={message.id} 
                      message={message} 
                      toggleFeedback={toggleFeedback}
                    />
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {renderSuggestedQuestions()}
              
              <div className="p-4 border-t border-gray-800 bg-gray-900 bg-opacity-95 backdrop-blur-sm sticky bottom-0 pb-6">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                  <div className="relative flex-1 bg-gray-800 rounded-lg">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        autoResizeTextarea();
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      className="w-full bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500 py-3 px-4 max-h-[120px] resize-none text-sm"
                      style={{ height: '44px' }}
                      rows={1}
                      autoFocus
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()} 
                    className={`shrink-0 h-11 w-11 rounded-full p-0 bg-gradient-to-r ${themeColors.primary} hover:${themeColors.primaryHover} transition-all duration-200 flex items-center justify-center`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <Send className="h-5 w-5 text-white" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      );
    }
    
    return <DesktopChat />;
  };

  return (
    <>
      {/* Chat Button - Just an icon with glowing effect */}
      {mode === 'minimized' && (
        <motion.button
          className={`fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg ${pulseButton ? 'shadow-indigo-500/50' : 'shadow-indigo-500/20'} transition-shadow duration-1000`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleChat}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            boxShadow: pulseButton 
              ? '0 0 0 0 rgba(99, 102, 241, 0.7)' 
              : '0 0 0 10px rgba(99, 102, 241, 0)'
          }}
          transition={{ 
            duration: 0.3,
            boxShadow: { duration: 1.5, repeat: Infinity, repeatType: 'reverse' } 
          }}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="sr-only">Chat with Hira</span>
          
          {/* Animated ring around the button */}
          <motion.div 
            className="absolute -inset-0.5 rounded-full border-2 border-indigo-400 opacity-0"
            animate={{ 
              opacity: [0, 0.8, 0],
              scale: [0.8, 1.2, 1.5],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop',
              times: [0, 0.5, 1]
            }}
          />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {mode === 'open' && renderChatbot()}
      </AnimatePresence>
    </>
  );
}

// Message bubble component with animations
function MessageBubble({ message, toggleFeedback }: { 
  message: MessageType, 
  toggleFeedback: (id: string, isHelpful: boolean) => void 
}) {
  const [showActions, setShowActions] = useState(false);
  const isUser = message.role === 'user';
  
  return (
    <motion.div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-none'}`}>
        {!isUser && (
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-1.5 ml-0.5">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        )}
        
        <div
          className={`relative rounded-2xl px-4 py-3 ${
            isUser 
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none shadow-md' 
              : 'bg-gray-800 text-gray-100 rounded-tl-none shadow-sm'
          }`}
          onMouseEnter={() => !isUser && setShowActions(true)}
          onMouseLeave={() => !isUser && setShowActions(false)}
        >
          <div className="prose prose-sm max-w-none text-current">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
          
          {!isUser && showActions && !message.feedback && (
            <motion.div 
              className="absolute -bottom-8 right-0 flex items-center gap-1 bg-gray-800 rounded-full p-1 shadow-md"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => toggleFeedback(message.id, true)}
                className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-green-400 transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => toggleFeedback(message.id, false)}
                className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
          
          {!isUser && message.feedback && (
            <div className="absolute -bottom-6 right-0 flex items-center gap-1">
              <span className="text-xs text-gray-500">
                {message.feedback.helpful ? 'Feedback: Helpful' : 'Feedback: Not helpful'}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}