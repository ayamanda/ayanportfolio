import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Profile, Project, Skill, Message as MessageType } from '../types';
import { doc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';
import { NameDialog } from './chat/NameDialog';
import { ChatWindow } from './chat/ChatWindow';
import { ChatButton } from './chat/ChatButton';
import { useChatInput } from '@/hooks/useChatInput';

interface ChatbotProps {
  profile: Profile;
  projects: Project[];
  skills: Skill[];
  userEmail?: string;
}

export default function Chatbot({ profile, projects, skills, userEmail }: ChatbotProps) {
  const [mode, setMode] = useState<'minimized' | 'open'>('minimized');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { input, setInput, inputRef, autoResizeTextarea } = useChatInput(isMobile);

  const suggestedQuestions = [
    "What kind of projects have you worked on?",
    "What are your main skills?",
    "Tell me about your experience",
    "How can I contact you?"
  ];

  const systemPrompt = `
  You are Hira, an AI assistant for ${profile.name}'s portfolio website. You are chatting with ${userName || 'a visitor'}. You are made by ${profile.name}. Here's the information about them:

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
  1. Address the user by their name (${userName}) when appropriate
  2. Keep responses concise, friendly, and professional
  3. When discussing projects or skills, provide specific examples from the portfolio
  4. If asked about topics not related to ${profile.name} or their work, politely decline to comment
  5. Use personal details to provide more contextual and relevant responses
  6. Only give contact information if asked about it
  `;

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (useLocalStorage && messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages, useLocalStorage]);

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const initChatSession = useCallback(async (name: string) => {
    try {
      const newSessionData = {
        id: uuidv4(),
        startTime: Date.now(),
        userEmail: userEmail || 'anonymous',
        userName: name,
        messages: [],
        deviceInfo: { 
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          screenSize: `${window.innerWidth}x${window.innerHeight}`
        }
      };
      
      const docRef = await addDoc(collection(db, 'chatSessions'), newSessionData);
      setSessionId(docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Failed to initialize chat session:', error);
      // If Firebase fails, use local storage
      setUseLocalStorage(true);
      const localSessionId = uuidv4();
      setSessionId(localSessionId);
      return localSessionId;
    }
  }, [userEmail]);

  const saveMessageToFirebase = async (message: MessageType, chatSessionId: string) => {
    if (useLocalStorage) return; // Skip Firebase if using local storage

    try {
      await addDoc(collection(db, 'messages'), {
        ...message,
        sessionId: chatSessionId,
        timestamp: serverTimestamp()
      });
      const sessionRef = doc(db, 'chatSessions', chatSessionId);
      await updateDoc(sessionRef, {
        lastMessage: message.content,
        lastActivityTime: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving message:', error);
      setUseLocalStorage(true); // Switch to local storage on error
    }
  };

  const endChatSession = useCallback(async () => {
    if (useLocalStorage) {
      localStorage.removeItem('chatMessages');
      return;
    }

    if (!sessionId) return;
    try {
      const sessionRef = doc(db, 'chatSessions', sessionId);
      await updateDoc(sessionRef, { endTime: Date.now() });
    } catch (error) {
      console.error('Error ending chat session:', error);
    }
  }, [sessionId, useLocalStorage]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setIsLoading(true);

    const newUserMessage: MessageType = {
      id: uuidv4(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    let chatSessionId = sessionId;
    if (!chatSessionId) {
      chatSessionId = await initChatSession(userName) || '';
    }

    if (!useLocalStorage) {
      await saveMessageToFirebase(newUserMessage, chatSessionId);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
          ]
        }),
      });

      if (!response.ok) throw new Error((await response.json()).error || 'Failed to get response');

      const data = await response.json();
      if (!data.message) throw new Error('Invalid response format');

      const newAssistantMessage: MessageType = {
        id: uuidv4(),
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, newAssistantMessage]);
      if (!useLocalStorage) {
        await saveMessageToFirebase(newAssistantMessage, chatSessionId);
      }

    } catch (error) {
      const errorMessage: MessageType = { 
        id: uuidv4(),
        role: 'assistant', 
        content: `Sorry, I encountered an error. Please try again.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleNameSubmit = async (name: string) => {
    setUserName(name);
    setShowNameDialog(false);
    setMode('open');

    // Set initial message once the name is known
    const welcomeMessage: MessageType = {
      id: uuidv4(),
      role: 'assistant',
      content: `👋 Hi ${name}! I'm Hira, your AI assistant. How can I help you learn more about Ayan and his works?`,
      timestamp: Date.now(),
    };
    
    setMessages([welcomeMessage]);
    
    const newSessionId = await initChatSession(name);
    if (!useLocalStorage && newSessionId) {
      await saveMessageToFirebase(welcomeMessage, newSessionId);
    }
  };

  const toggleFeedback = async (messageId: string, isHelpful: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, feedback: { helpful: isHelpful } }
        : msg
    ));
  };

  const renderSuggestedQuestions = () => {
    if (messages.length > 1) return null;

    return (
      <div className="border-t border-gray-800/50 bg-gray-900/90 backdrop-blur-md">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Suggested Questions</h3>
          <div className="grid gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  setInput(q);
                  setTimeout(() => handleSubmit(), 0);
                }}
                className="text-left p-2 rounded bg-gray-800 hover:bg-gray-700 text-sm text-white transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Effect to scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <NameDialog 
        open={showNameDialog} 
        onSubmit={handleNameSubmit}
      />

      {mode === 'minimized' && (
        <ChatButton 
          onClick={() => {
            if (!userName) {
              setShowNameDialog(true);
            } else {
              setMode('open');
            }
          }} 
        />
      )}

      {mode === 'open' && (
        <ChatWindow
          height={isMobile ? window.innerHeight : 600}
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
          isMobile={isMobile}
        />
      )}
    </>
  );
}