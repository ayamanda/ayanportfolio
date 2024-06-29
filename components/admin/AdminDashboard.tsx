import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, User, Briefcase, Code, LogOut } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { ProfileSection } from './ProfileSection';
import { ProjectsSection } from './ProjectsSection';
import { SkillsSection } from './SkillsSection';

export const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useFirebaseAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <motion.nav
        className={`bg-gray-800 w-64 p-4 ${isMobileMenuOpen ? 'block' : 'hidden'} md:block`}
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden">
            <X size={24} />
          </button>
        </div>
        <ul>
          {[
            { name: 'Profile', icon: User },
            { name: 'Projects', icon: Briefcase },
            { name: 'Skills', icon: Code },
          ].map(({ name, icon: Icon }) => (
            <li key={name} className="mb-2">
              <button
                onClick={() => setActiveSection(name.toLowerCase())}
                className={`flex items-center w-full p-2 rounded ${
                  activeSection === name.toLowerCase() ? 'bg-indigo-600' : 'hover:bg-gray-700'
                }`}
              >
                <Icon size={20} className="mr-2" />
                {name}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={handleLogout} className="flex items-center mt-auto p-2 hover:bg-gray-700 rounded">
          <LogOut size={20} className="mr-2" />
          Logout
        </button>
      </motion.nav>

      {/* Main content */}
      <div className="flex-1 p-8">
        <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden mb-4">
          <Menu size={24} />
        </button>

        {activeSection === 'profile' && <ProfileSection />}
        {activeSection === 'projects' && <ProjectsSection />}
        {activeSection === 'skills' && <SkillsSection />}
      </div>
    </div>
  );
};