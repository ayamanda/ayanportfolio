import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  RefreshCw, 
  Calendar, 
  Clock, 
  User, 
  Monitor, 
  Smartphone, 
  Globe, 
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Eye,
  MoreVertical,
  Download,
  Trash2
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  where, 
  deleteDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Types (add these to your types file)
interface ChatSession {
  id?: string;
  startTime: number;
  endTime?: number;
  userEmail: string;
  userName?: string;
  messages: any[];
  deviceInfo?: {
    userAgent: string;
    platform: string;
    screenSize: string;
  };
  lastMessage?: string;
  lastActivityTime?: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  feedback?: {
    helpful: boolean;
    timestamp: number;
    messageId: string;
  };
}

interface ConversationWithMessages extends ChatSession {
  messages: Message[];
  messageCount: number;
  lastActivity: Date;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  duration?: number;
}

export const ConversationsSection: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ConversationWithMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'longest' | 'shortest'>('recent');
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMessages | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Fetch conversations from Firebase
  const fetchConversations = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);

    try {
      // Fetch chat sessions
      const sessionsQuery = query(
        collection(db, 'chatSessions'),
        orderBy('startTime', 'desc')
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);

      const conversationsData: ConversationWithMessages[] = [];

      // For each session, fetch its messages
      for (const sessionDoc of sessionsSnapshot.docs) {
        const sessionData = sessionDoc.data() as ChatSession;
        
        // Fetch messages for this session
        const messagesQuery = query(
          collection(db, 'messages'),
          where('sessionId', '==', sessionDoc.id),
          orderBy('timestamp', 'asc')
        );
        const messagesSnapshot = await getDocs(messagesQuery);

        const messages: Message[] = messagesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: data.id,
            role: data.role,
            content: data.content,
            timestamp: data.timestamp?.toMillis() || Date.now(),
            feedback: data.feedback
          };
        });

        // Determine device type from user agent
        const getDeviceType = (userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' => {
          if (!userAgent) return 'unknown';
          const ua = userAgent.toLowerCase();
          if (ua.includes('mobile')) return 'mobile';
          if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
          if (ua.includes('desktop') || ua.includes('electron')) return 'desktop';
          return ua.includes('mozilla') ? 'desktop' : 'unknown';
        };

        // Calculate conversation duration
        const duration = sessionData.endTime && sessionData.startTime 
          ? sessionData.endTime - sessionData.startTime 
          : undefined;

        const conversationData: ConversationWithMessages = {
          ...sessionData,
          id: sessionDoc.id,
          messages,
          messageCount: messages.length,
          lastActivity: new Date(sessionData.lastActivityTime || sessionData.startTime),
          deviceType: getDeviceType(sessionData.deviceInfo?.userAgent || ''),
          duration
        };

        conversationsData.push(conversationData);
      }

      setConversations(conversationsData);
      setFilteredConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter and sort conversations
  useEffect(() => {
    let filtered = [...conversations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(conv => 
        conv.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply date filter
    const now = new Date();
    switch (filterBy) {
      case 'today':
        filtered = filtered.filter(conv => {
          const convDate = new Date(conv.startTime);
          return convDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(conv => new Date(conv.startTime) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(conv => new Date(conv.startTime) >= monthAgo);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => a.startTime - b.startTime);
        break;
      case 'longest':
        filtered.sort((a, b) => (b.duration || 0) - (a.duration || 0));
        break;
      case 'shortest':
        filtered.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        break;
    }

    setFilteredConversations(filtered);
  }, [conversations, searchTerm, filterBy, sortBy]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, []);

  // Delete conversation
  const deleteConversation = async (conversationId: string) => {
    try {
      // Delete all messages for this session
      const messagesQuery = query(
        collection(db, 'messages'),
        where('sessionId', '==', conversationId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const deletePromises = messagesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      // Delete the session
      await deleteDoc(doc(db, 'chatSessions', conversationId));

      // Update local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Export conversation data
  const exportConversation = (conversation: ConversationWithMessages) => {
    const data = {
      session: {
        id: conversation.id,
        userName: conversation.userName,
        userEmail: conversation.userEmail,
        startTime: new Date(conversation.startTime).toISOString(),
        endTime: conversation.endTime ? new Date(conversation.endTime).toISOString() : null,
        duration: conversation.duration,
        deviceInfo: conversation.deviceInfo
      },
      messages: conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp).toISOString(),
        feedback: msg.feedback
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversation.userName || 'anonymous'}-${new Date(conversation.startTime).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Toggle card expansion
  const toggleCardExpansion = (conversationId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  // Format duration
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // Get device icon
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Monitor className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  // Statistics
  const stats = {
    total: conversations.length,
    today: conversations.filter(conv => 
      new Date(conv.startTime).toDateString() === new Date().toDateString()
    ).length,
    averageMessages: conversations.length > 0 
      ? Math.round(conversations.reduce((sum, conv) => sum + conv.messageCount, 0) / conversations.length)
      : 0,
    totalMessages: conversations.reduce((sum, conv) => sum + conv.messageCount, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Conversations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Messages</p>
                <p className="text-2xl font-bold">{stats.averageMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="longest">Longest</SelectItem>
                  <SelectItem value="shortest">Shortest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => fetchConversations(true)} 
              disabled={refreshing}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conversations List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredConversations.map((conversation) => {
            const isExpanded = expandedCards.has(conversation.id!);
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            
            return (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Avatar>
                          <AvatarFallback>
                            {conversation.userName?.[0]?.toUpperCase() || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold truncate">
                              {conversation.userName || 'Anonymous'}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {conversation.messageCount} messages
                            </Badge>
                            {getDeviceIcon(conversation.deviceType)}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {conversation.userEmail || 'No email provided'}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(conversation.startTime).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(conversation.startTime).toLocaleTimeString()}
                            </span>
                            {conversation.duration && (
                              <span className="flex items-center">
                                Duration: {formatDuration(conversation.duration)}
                              </span>
                            )}
                          </div>
                          
                          {lastMessage && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                              <span className="font-medium">Last message: </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {lastMessage.content.length > 100 
                                  ? `${lastMessage.content.substring(0, 100)}...` 
                                  : lastMessage.content}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>
                                Conversation with {conversation.userName || 'Anonymous'}
                              </DialogTitle>
                              <DialogDescription>
                                Started on {new Date(conversation.startTime).toLocaleString()}
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh] pr-4">
                              <div className="space-y-4">
                                {conversation.messages.map((message) => (
                                  <div 
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div 
                                      className={`max-w-[80%] p-3 rounded-lg ${
                                        message.role === 'user' 
                                          ? 'bg-blue-500 text-white' 
                                          : 'bg-gray-100 dark:bg-gray-800'
                                      }`}
                                    >
                                      <p className="text-sm">{message.content}</p>
                                      <div className="flex items-center justify-between mt-2">
                                        <span className="text-xs opacity-70">
                                          {new Date(message.timestamp).toLocaleTimeString()}
                                        </span>
                                        {message.feedback && (
                                          <div className="flex items-center space-x-1">
                                            {message.feedback.helpful ? 
                                              <ThumbsUp className="w-3 h-3 text-green-500" /> :
                                              <ThumbsDown className="w-3 h-3 text-red-500" />
                                            }
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => exportConversation(conversation)}>
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteConversation(conversation.id!)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardExpansion(conversation.id!)}
                        >
                          {isExpanded ? 
                            <ChevronDown className="w-4 h-4" /> : 
                            <ChevronRight className="w-4 h-4" />
                          }
                        </Button>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 pt-4 border-t"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium mb-2">Device Info</h4>
                              <div className="text-sm space-y-1">
                                <p><span className="font-medium">Platform:</span> {conversation.deviceInfo?.platform || 'Unknown'}</p>
                                <p><span className="font-medium">Screen:</span> {conversation.deviceInfo?.screenSize || 'Unknown'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Engagement</h4>
                              <div className="text-sm space-y-1">
                                <p><span className="font-medium">Messages:</span> {conversation.messageCount}</p>
                                <p><span className="font-medium">User messages:</span> {conversation.messages.filter(m => m.role === 'user').length}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2">Feedback</h4>
                              <div className="text-sm space-y-1">
                                <p><span className="font-medium">Helpful:</span> {conversation.messages.filter(m => m.feedback?.helpful === true).length}</p>
                                <p><span className="font-medium">Not helpful:</span> {conversation.messages.filter(m => m.feedback?.helpful === false).length}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium">Recent Messages</h4>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {conversation.messages.slice(-3).map((message) => (
                                <div 
                                  key={message.id}
                                  className={`p-2 rounded text-sm ${
                                    message.role === 'user' 
                                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-400' 
                                      : 'bg-gray-50 dark:bg-gray-800 border-l-2 border-gray-400'
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium capitalize">{message.role}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300">
                                    {message.content.length > 200 
                                      ? `${message.content.substring(0, 200)}...` 
                                      : message.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredConversations.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                No conversations found
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No conversations have been started yet'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};