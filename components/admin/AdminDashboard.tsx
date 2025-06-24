import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Code2, MessageSquare, LogOut, Sun, Moon, Menu, ChevronRight, Bell, FolderGit2, MessagesSquare } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { ProfileSection } from './ProfileSection';
import { SkillsSection } from './SkillsSection';
import { ProjectsSection } from './ProjectSection/ProjectsSection';
import { MessagesSection } from './MessagesSection';
import { ConversationsSection } from './ConversationSection';
import { ExperienceSection } from './ExperienceSection/ExperienceSection';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const navItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'skills', label: 'Skills', icon: Code2 },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'conversations', label: 'Conversations', icon: MessagesSquare },
];

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { logout } = useFirebaseAuth();
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  useEffect(() => {
    // Check system preference
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <motion.aside
        initial={isMobile ? { x: -300 } : false}
        animate={isMobile ? { x: isMobileMenuOpen ? 0 : -300 } : false}
        className={`fixed md:relative w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 ${
          isMobile && !isMobileMenuOpen ? '-translate-x-full' : ''
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Panel</h2>
          </div>

          <ScrollArea className="flex-grow">
            <div className="px-3">
              {navItems.map(({ id, label, icon: Icon }) => (
                <motion.div key={id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={activeSection === id ? "secondary" : "ghost"}
                    className={`w-full justify-start mb-1 ${
                      activeSection === id 
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => {
                      setActiveSection(id);
                      if (isMobile) setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                    {activeSection === id && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem className="text-gray-600 dark:text-gray-300">No new notifications</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile menu button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      )}

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeSection === 'profile' && <ProfileSection />}
            {activeSection === 'projects' && <ProjectsSection />}
            {activeSection === 'skills' && <SkillsSection />}
            {activeSection === 'messages' && <MessagesSection />}
            {activeSection === 'conversations' && <ConversationsSection />}
            {activeSection === 'experience' && <ExperienceSection />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;