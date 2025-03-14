import { useState, useCallback } from 'react';
import { Message, ChatSession } from '../types';
import { db } from '@/firebase';
import { doc, collection, addDoc, updateDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export const useChat = (userEmail?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const initChatSession = useCallback(async () => {
    try {
      if (userEmail && userEmail !== 'anonymous') {
        const sessionsRef = collection(db, 'chatSessions');
        const q = query(
          sessionsRef, 
          where('userEmail', '==', userEmail),
          orderBy('startTime', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const recentSession = querySnapshot.docs[0];
          setSessionId(recentSession.id);
          
          const messagesRef = collection(db, 'messages');
          const messagesQuery = query(
            messagesRef,
            where('sessionId', '==', recentSession.id),
            orderBy('timestamp', 'asc')
          );
          
          const messagesSnapshot = await getDocs(messagesQuery);
          
          if (!messagesSnapshot.empty) {
            const loadedMessages = messagesSnapshot.docs.map(doc => ({
              id: doc.data().id,
              role: doc.data().role,
              content: doc.data().content,
              timestamp: doc.data().timestamp?.toMillis() || Date.now(),
              feedback: doc.data().feedback
            }));
            
            setMessages(loadedMessages);
            return recentSession.id;
          }
        }
      }
      
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
      };
      
      const newSession: ChatSession = {
        id: uuidv4(),
        startTime: Date.now(),
        userEmail: userEmail || 'anonymous',
        messages: [],
        deviceInfo
      };
      
      const docRef = await addDoc(collection(db, 'chatSessions'), newSession);
      setSessionId(docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error in chat session:', error);
      return null;
    }
  }, [userEmail]);

  const saveMessage = async (message: Message, chatSessionId: string) => {
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
    }
  };

  return {
    messages,
    setMessages,
    sessionId,
    setSessionId,
    isLoading,
    setIsLoading,
    initChatSession,
    saveMessage
  };
};