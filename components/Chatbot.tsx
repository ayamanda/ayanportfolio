import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Loader2, Send, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Profile, Project, Skill, Message as MessageType, ChatSession } from '../types';
import { doc, collection, addDoc, updateDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput } from './chat/ChatInput';
import { ChatButton } from './chat/ChatButton';
import { ChatWindow } from './chat/ChatWindow';

interface ChatbotProps {
  profile: Profile;
  projects: Project[];
  skills: Skill[];
  userEmail?: string;
}

export default function Chatbot({ profile, projects, skills, userEmail }: ChatbotProps) {
  const [mode, setMode] = useState<'minimized' | 'open'>('minimized');
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: "👋 Hi! I'm Hira, your AI assistant. How can I help you learn more about Ayan and his works",
      timestamp: Date.now(),
    }
  ]);
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [pulseButton, setPulseButton] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Create the system prompt
  const systemPrompt = `
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
  `;

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
        ...messages[0],
        sessionId: docRef.id,
        timestamp: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating/retrieving chat session:', error);
      return null;
    }
  }, [userEmail, messages]);

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
      
      if (mode === 'open' && !isDesktop && messagesEndRef.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    }
  };

  // Set desktop mode on mount and resize
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    // Check on mount
    checkDesktop();
    
    // Check on resize
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Keep button animated when minimized
  useEffect(() => {
    if (mode === 'minimized') {
      const pulseInterval = setInterval(() => {
        setPulseButton(prev => !prev);
      }, 3000);
      
      return () => clearInterval(pulseInterval);
    }
  }, [mode]);

  // Initialize session when chat opens
  useEffect(() => {
    if (mode === 'open' && !sessionId) {
      initChatSession();
    }
  }, [mode, sessionId, initChatSession]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
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

  // Add this useEffect for better mobile keyboard handling
  useEffect(() => {
  // Focus the input when chat is opened
  if (mode === 'open' && inputRef.current) {
    // Small delay to ensure the component is fully rendered
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }
  
  // Scroll to the most recent message when opening chat
  if (mode === 'open' && messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }
  }, [mode]);

  // Add this function to handle visibility changes (for when app comes back from background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mode === 'open' && inputRef.current) {
        // Refocus the input when the app comes back to foreground
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mode]);

  // Add new useEffects for keyboard handling
  useEffect(() => {
    const handleResize = () => {
      if (mode === 'open' && messagesEndRef.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mode]);

  useEffect(() => {
    const metaViewport = document.querySelector('meta[name=viewport]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    return () => {
      if (metaViewport) {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, []);

  // Modify the handleSubmit function to maintain keyboard focus
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;
    
    // Clear input but maintain focus
    setInput('');
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      // Important: Keep focus after sending message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
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
            { role: 'system', content: systemPrompt },
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

  // Animation variants
  const chatVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
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
    }
  };

  // Mobile chat interface using a fixed position container
  const renderMobileChat = () => {
    if (mode !== 'open') return null;
    
    return (
      <motion.div
        className="fixed inset-0 z-50 flex flex-col bg-gray-900 text-white"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={chatVariants}
      >
        {/* Header */}
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
            onClick={toggleChat}
            className="text-gray-200 hover:text-white hover:bg-purple-700/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Messages container */}
        <div 
          className="flex-grow overflow-y-auto"
          ref={chatContainerRef}
        >
          <div className="px-4 py-2 min-h-full">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg max-w-[85%] ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center space-x-2 text-gray-400 mb-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {renderSuggestedQuestions()}
        
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResizeTextarea();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white min-h-[40px] max-h-[120px] resize-none"
              style={{ height: 'auto' }}
              rows={1}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="shrink-0 w-10 h-10 p-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    );
  };
  
  return (
    <>
      {/* Chat Button */}
      {mode === 'minimized' && (
        <motion.button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 z-40 p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg text-white"
          initial="initial"
          animate={pulseButton ? "pulse" : "initial"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variants={buttonVariants}
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
      )}

      {/* Desktop Version */}
      {isDesktop ? (
        <AnimatePresence>
          {mode === 'open' && (
            <ChatWindow
              height={Math.max(window.innerHeight * 0.75, 600)}
              messages={messages}
              isLoading={isLoading}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              handleKeyDown={handleKeyDown}
              toggleFeedback={toggleFeedback}
              endChatSession={endChatSession}
              setMode={setMode}
              messagesEndRef={messagesEndRef}
              inputRef={inputRef}
              autoResizeTextarea={autoResizeTextarea}
              renderSuggestedQuestions={renderSuggestedQuestions}
            />
          )}
        </AnimatePresence>
      ) : (
        <AnimatePresence>
          {renderMobileChat()}
        </AnimatePresence>
      )}
    </>
  );
}