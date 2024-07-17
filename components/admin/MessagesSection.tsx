import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, onValue, query, orderByChild, remove } from 'firebase/database';
import { app } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Trash2, Filter, Search, ExternalLink, ChevronLeft, ChevronRight, MapPin, Calendar, Clock, ArrowUpDown } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
  location?: string;
  ipAddress?: string;
}

interface PaginationProps {
  className?: string;
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (pageNumber: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ className, currentPage, totalCount, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className='bg-gray-800'
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className='bg-gray-800'
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
};

export const MessagesSection: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Message>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const db = getDatabase(app);
    const messagesRef = query(ref(db, 'messages'), orderByChild('timestamp'));

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        messagesData.push({ id: childSnapshot.key as string, ...message });
      });
      setMessages(messagesData.reverse());
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSortChange = (value: string) => {
    setSortBy(value as keyof Message);
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const sortedAndFilteredMessages = useMemo(() => {
    let result = [...messages];

    if (searchTerm) {
      result = result.filter(
        (message) =>
          message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (aValue != null && bValue != null) {
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return result;
  }, [messages, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    setFilteredMessages(sortedAndFilteredMessages);
  }, [sortedAndFilteredMessages]);

  const handleSendEmail = (email: string, subject: string, body: string) => {
    console.log(`Sending email to ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    toast({
      title: "Email Sent",
      description: `Email sent to ${email}`,
      duration: 3000,
    });
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const db = getDatabase(app);
      await remove(ref(db, `messages/${id}`));
      toast({
        title: "Message Deleted",
        description: "The message has been successfully deleted.",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: "Error",
        description: "Failed to delete the message. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const openGoogleMaps = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
  };

  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading messages...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Client Messages</h2>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-gray-800"
          />
          <Search className="text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] bg-gray-800">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp">Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className='bg-gray-800'
          >
            <ArrowUpDown className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="card" className="w-full">
        <TabsList>
          <TabsTrigger value="card">Card View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          
        </TabsList>
        <TabsContent value="table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell>{message.name}</TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{message.message}</TableCell>
                  <TableCell>{new Date(message.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    {message.location ? (
                      <Button
                        variant="link"
                        onClick={() => openGoogleMaps(message.location!)}
                        className="p-0 h-auto font-normal text-blue-500 hover:text-blue-600"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        {message.location}
                      </Button>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedMessage(message)} className='bg-gray-800'>
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-800 text-white">
                                <DialogHeader>
                                  <DialogTitle>Reply to {selectedMessage?.name}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  const form = e.target as HTMLFormElement;
                                  const subject = (form.elements.namedItem('subject') as HTMLInputElement).value;
                                  const body = (form.elements.namedItem('body') as HTMLTextAreaElement).value;
                                  if (selectedMessage) {
                                    handleSendEmail(selectedMessage.email, subject, body);
                                  }
                                }} className="space-y-4">
                                  <Input name="subject" placeholder="Subject" className="bg-gray-700 text-white" />
                                  <Textarea name="body" placeholder="Your message" className="bg-gray-700 text-white" rows={5} />
                                  <Button type="submit" className='bg-gray-800'>Send Email</Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Reply to message</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteMessage(message.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete message</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMessages.map((message) => (
              <Card key={message.id} className="bg-gray-800 text-white">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{message.name}</span>
                    <Badge variant="outline" className='text-white'>
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(message.timestamp).toLocaleDateString()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 mb-2 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {message.email}
                  </p>
                  <p className="mb-2 line-clamp-3">{message.message}</p>
                  {message.location && (
                    <Button
                      variant="secondary"
                      onClick={() => openGoogleMaps(message.location!)}
                      className="p-0 h-auto font-normal text-blue-500 hover:text-blue-600"
                    >
                      <MapPin className='bg-transparent' />
                    </Button>
                  )}
                  {message.location && (
                    <p className="text-xs text-gray-400 flex items-center mt-1">
                    </p>
                  )}
                  {message.ipAddress && (
                    <p className="text-xs text-gray-400 flex items-center mt-1">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      IP: {message.ipAddress}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Badge>
                  <div className="flex space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedMessage(message)} className='bg-gray-800'>
                                <Mail className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 text-white">
                              <DialogHeader>
                                <DialogTitle>Reply to {selectedMessage?.name}</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const subject = (form.elements.namedItem('subject') as HTMLInputElement).value;
                                const body = (form.elements.namedItem('body') as HTMLTextAreaElement).value;
                                if (selectedMessage) {
                                  handleSendEmail(selectedMessage.email, subject, body);
                                }
                              }} className="space-y-4">
                                <Input name="subject" placeholder="Subject" className="bg-gray-700 text-white" />
                                <Textarea name="body" placeholder="Your message" className="bg-gray-700 text-white" rows={5} />
                                <Button type="submit" className='bg-gray-800'>Send Email</Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reply to message</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteMessage(message.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete message</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Pagination
        className="mt-4"
        currentPage={currentPage}
        totalCount={filteredMessages.length}
        pageSize={messagesPerPage}
        onPageChange={paginate}
      />
    </div>
  );
};