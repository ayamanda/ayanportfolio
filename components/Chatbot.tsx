import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Loader2, Send, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Profile, Project, Skill, Message as MessageType, ChatSession } from '../types';
import { doc, collection, addDoc, updateDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';
import {
  Drawer,
  DrawerContent
} from "@/components/ui/drawer";
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';

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
  content: "👋 Hi! I'm Hira, your AI assistant. How can I help you learn more about Ayan and his works",
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
          orderBy('startTime', 'desc')
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

  // End chat session
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
  }, [sessionId]);

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

  // Auto-resize text area based on content
  const autoResizeTextarea = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const newHeight = Math.min(inputRef.current.scrollHeight, 120);
      inputRef.current.style.height = `${newHeight}px`;
    }
  };

  // Keep button animated when minimized - improved animation
  useEffect(() => {
    if (mode === 'minimized') {
      const pulseInterval = setInterval(() => {
        setPulseButton(prev => !prev);
      }, 3000);
      
      return () => clearInterval(pulseInterval);
    }
  }, [mode]);

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
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const userMessage = input.trim();
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

  // Handle suggested question
  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      handleSubmit();
    }, 100);
  };

  const toggleChat = useCallback(() => {
    if (mode === 'minimized') {
      setMode('open');
    } else {
      endChatSession();
      setMode('minimized');
    }
  }, [mode, endChatSession]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

 // Render suggested questions chips
 const renderSuggestedQuestions = () => {
  if (!showSuggestions || messages.length > 1) return null;
  
  return (
    <div className="px-4 py-3 space-y-2">
      <p className="text-xs text-gray-400 font-medium">Suggested questions:</p>
      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => handleSuggestedQuestion(question)}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-full border border-gray-700/50 transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

// Improved scroll behavior for new messages
useEffect(() => {
  if (messagesEndRef.current) {
    // Delay scrolling to ensure content is rendered first
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}, [messages, isLoading]);

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (sessionId) {
      endChatSession();
    }
  };
}, [sessionId, endChatSession]);

// Detect viewport to apply different styling for desktop and mobile
const [isDesktop, setIsDesktop] = useState(false);
const [windowHeight, setWindowHeight] = useState(0);

// Set desktop mode and window height on mount and resize
useEffect(() => {
  const checkDimensions = () => {
    setIsDesktop(window.innerWidth >= 1024);
    setWindowHeight(window.innerHeight);
  };
  
  // Check on mount
  checkDimensions();
  
  // Check on resize
  window.addEventListener('resize', checkDimensions);
  return () => window.removeEventListener('resize', checkDimensions);
}, []);

// Calculate dynamic height for chat window based on viewport
const getChatHeight = () => {
  if (isDesktop) {
    // Taller on desktop - 75% of viewport height but at least 600px
    return Math.max(windowHeight * 0.75, 600);
  } else {
    // On mobile, use 85% of viewport height
    return windowHeight * 0.85;
  }
};

// Button animation variants
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
  <>
    {/* Only render button when chat is minimized */}
    {mode === 'minimized' && (
      <motion.button
        onClick={toggleChat}
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
    )}

    {isDesktop ? (
      // Desktop Mode - Fixed Panel with dynamic height
      <AnimatePresence>
        {mode === 'open' && (
          <motion.div 
            className="fixed bottom-6 right-6 w-96 rounded-2xl shadow-xl z-30 overflow-hidden border border-gray-700 flex flex-col bg-gray-900 "
            style={{ height: `${getChatHeight()}px` }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header - Only close button here */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gradient-to-r from-indigo-800 to-purple-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-medium bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">Chat with Hira</h3>
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

            {/* Messages - Dynamic height for desktop with improved scroll */}
            <div className="flex-1 overflow-hidden">
              <ChatMessages 
                messages={messages} 
                isLoading={isLoading} 
                toggleFeedback={toggleFeedback}
                messagesEndRef={messagesEndRef}
              />
            </div>

            {/* Suggested Questions */}
            {renderSuggestedQuestions()}

            {/* Input */}
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
        )}
      </AnimatePresence>
    ) : (
      // Mobile Mode - Drawer from bottom (improved)
      <Drawer open={mode === 'open'} onOpenChange={(open) => {
        if (!open) {
          endChatSession();
          setMode('minimized');
        }
      }}>
        <DrawerContent className="max-h-[90vh] rounded-t-xl bg-gray-900 text-white border-t border-gray-700">
          <div className="flex flex-col h-[85vh]">
            {/* Header - Only close button here */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-medium bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">Chat with Hira</h3>
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

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <ChatMessages 
                messages={messages} 
                isLoading={isLoading} 
                toggleFeedback={toggleFeedback}
                messagesEndRef={messagesEndRef}
              />
            </div>

            {/* Suggested Questions */}
            {renderSuggestedQuestions()}

            {/* Input */}
            <ChatInput 
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
              handleKeyDown={handleKeyDown}
              inputRef={inputRef}
              autoResizeTextarea={autoResizeTextarea}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )}
  </>
);
}