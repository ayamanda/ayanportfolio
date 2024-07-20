import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Code, MessageSquare, LogOut, Sun, Moon, Menu, ChevronRight, Bell } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { ProfileSection } from './ProfileSection';
import { ProjectsSection } from './ProjectSection/ProjectsSection';
import { SkillsSection } from './SkillsSection';
import { MessagesSection } from './MessagesSection';
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

const navItems = [
  { name: 'Profile', icon: User },
  { name: 'Projects', icon: Briefcase },
  { name: 'Skills', icon: Code },
  { name: 'Messages', icon: MessageSquare },
];

export const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const { user, logout } = useFirebaseAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const Sidebar = ({ isMobile = false }) => (
    <motion.nav
      className={`bg-white dark:bg-gray-800 ${isMobile ? 'w-full' : 'w-64'} h-full flex flex-col`}
      initial={false}
      animate={{ x: isSidebarVisible ? 0 : (isMobile ? '100%' : '-100%') }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-6">
          <Avatar>
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
            <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{user?.displayName || 'Admin'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Administrator</p>
          </div>
        </div>
        <Separator className="my-4" />
      </div>
      <ScrollArea className="flex-grow">
        <div className="px-3">
          {navItems.map(({ name, icon: Icon }) => (
            <motion.div key={name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={activeSection === name.toLowerCase() ? "secondary" : "ghost"}
                className={`w-full justify-start mb-1 ${activeSection === name.toLowerCase() ? 'bg-primary/10 dark:bg-primary/20' : ''}`}
                onClick={() => {
                  setActiveSection(name.toLowerCase());
                  if (isMobile) setIsMobileMenuOpen(false);
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {name}
                {activeSection === name.toLowerCase() && (
                  <ChevronRight className="ml-auto h-4 w-4" />
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4">
        <Separator className="my-4" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Dark Mode</span>
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
            aria-label="Toggle dark mode"
          />
        </div>
        <Button variant="destructive" onClick={handleLogout} className="w-full">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </motion.nav>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Bell className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>New message received</DropdownMenuItem>
                  <DropdownMenuItem>Project update available</DropdownMenuItem>
                  <DropdownMenuItem>Skill assessment completed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'profile' && <ProfileSection />}
                {activeSection === 'projects' && <ProjectsSection />}
                {activeSection === 'skills' && <SkillsSection />}
                {activeSection === 'messages' && <MessagesSection />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};