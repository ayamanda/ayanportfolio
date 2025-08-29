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
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { input, setInput, inputRef, autoResizeTextarea } = useChatInput(isMobile);

  const suggestedQuestions = [
    "🚀 What are your most impressive projects?",
    "💻 What technologies do you specialize in?",
    "📈 Tell me about your professional experience",
    "📞 How can I get in touch with you?",
    "🎯 What type of work are you looking for?",
    "⚡ What makes you stand out as a developer?"
  ];

  const systemPrompt = `
  You are Hira, an intelligent AI assistant for ${profile.name}'s portfolio website. You are chatting with ${userName || 'a visitor'}. You represent ${profile.name} professionally and helpfully.

  ABOUT ${profile.name.toUpperCase()}:
  Name: ${profile.name}
  Title: ${profile.title || 'Developer'}
  About: ${profile.about}

  TECHNICAL SKILLS:
  ${skills.map(skill => `• ${skill.name}`).join('\n')}

  CONTACT INFORMATION:
  Email: ${profile.email || 'ayanmandal059@gmail.com'}
  Phone: ${profile.phone || '+91 8927081490'}

  FEATURED PROJECTS:
  ${projects.map(project => `
  📁 ${project.name}
     Description: ${project.description}
     ${project.tags ? `Technologies: ${project.tags.join(', ')}` : ''}
     ${project.link ? `Live Demo: ${project.link}` : ''}
  `).join('\n')}

  CONVERSATION GUIDELINES:
  1. Be warm, professional, and engaging
  2. Address users by name (${userName}) when appropriate
  3. Provide specific examples from the portfolio when discussing projects or skills
  4. Keep responses concise but informative (2-3 sentences max unless asked for details)
  5. Use emojis sparingly but effectively to enhance communication
  6. If asked about unrelated topics, politely redirect to ${profile.name}'s work
  7. Only share contact information when specifically requested
  8. Encourage users to explore the portfolio and reach out for opportunities
  9. Be enthusiastic about ${profile.name}'s work and achievements
  10. Offer to provide more details about any specific project or skill mentioned
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
    if (!userMessage || isLoading || isStreaming) return;

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

    // Create placeholder message for streaming
    const assistantMessageId = uuidv4();
    const placeholderMessage: MessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, placeholderMessage]);
    setStreamingMessageId(assistantMessageId);
    setIsLoading(false);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
          ],
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'content') {
                  accumulatedContent += data.content;
                  
                  // Update the streaming message
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ));
                } else if (data.type === 'done') {
                  // Streaming complete
                  break;
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                // Skip invalid JSON lines
                continue;
              }
            }
          }
        }

        // Save final message to Firebase
        if (!useLocalStorage && accumulatedContent) {
          const finalMessage: MessageType = {
            id: assistantMessageId,
            role: 'assistant',
            content: accumulatedContent,
            timestamp: Date.now()
          };
          await saveMessageToFirebase(finalMessage, chatSessionId);
        }

      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('Streaming error:', error);
      
      // Replace placeholder with error message
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: 'Sorry, I encountered an error while processing your request. Please try again.' 
            }
          : msg
      ));
    } finally {
      setIsStreaming(false);
      setStreamingMessageId('');
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
      content: `👋 Hi ${name}! I'm Hira, ${profile.name}'s AI assistant. I'm here to help you explore ${profile.name}'s portfolio, learn about their projects, and answer any questions you might have. What would you like to know?`,
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
          isStreaming={isStreaming}
          streamingMessageId={streamingMessageId}
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