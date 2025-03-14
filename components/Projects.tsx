import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';
import ProjectCard from './ProjectCard';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, ArrowUpDown } from 'lucide-react';

interface ProjectsProps {
  projects: Project[];
}

type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'reverseAlphabetical';

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle URL parameters on mount and changes
  useEffect(() => {
    const projectParam = searchParams.get('project');
    const projectId = searchParams.get('id');
    const projectSlug = searchParams.get('slug');
    
    if (projectParam) {
      setSearchTerm(projectParam);
    }
    
    // Validate project ID or slug in URL
    if (projectId || projectSlug) {
      const project = projectId 
        ? projects.find(p => p.id === projectId)
        : projects.find(p => p.slug === projectSlug);
      
      if (!project) {
        setError('Project not found');
        setTimeout(() => {
          router.replace('/projects');
          setError(null);
        }, 3000);
      }
    }
  }, [searchParams, projects, router]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSortOption('newest');
  };

  // Sort projects based on selected option
  const sortProjects = (projectsList: Project[]) => {
    switch(sortOption) {
      case 'newest':
        return projectsList; // Assuming the original order is newest first
      case 'oldest':
        return [...projectsList].reverse();
      case 'alphabetical':
        return [...projectsList].sort((a, b) => a.name.localeCompare(b.name));
      case 'reverseAlphabetical':
        return [...projectsList].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return projectsList;
    }
  };

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return sortProjects(filtered);
  }, [projects, searchTerm, sortOption]);

  const hasActiveFilters = searchTerm || sortOption !== 'newest';

  // Generate shareable link for a project
  const generateProjectLink = (project: Project) => {
    return project.slug ? `?slug=${project.slug}` : `?id=${project.id}`;
  };

  // Toggle sort option in sequence
  const toggleSortOption = () => {
    setSortOption(prev => {
      if (prev === 'newest') return 'oldest';
      if (prev === 'oldest') return 'alphabetical';
      if (prev === 'alphabetical') return 'reverseAlphabetical';
      return 'newest';
    });
  };

  return (
    <section className="py-8 sm:py-16 px-4 min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            My Projects
          </h2>
          <p className="text-gray-400 text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
            Explore my portfolio of projects spanning web development, design, and more. 
            Use the search to find specific projects.
          </p>
        </motion.div>

        {/* Search and filter controls */}
        <div className="mb-8 bg-gray-800/50 p-4 sm:p-6 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-2 w-full bg-gray-900 border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">              
              <Button
                variant="outline"
                className="border-gray-700 hover:bg-purple-900/30 hover:text-purple-300 transition-colors text-gray-400 bg-gray-800/50"
                onClick={toggleSortOption}
              >
                <ArrowUpDown size={16} className="mr-2" />
                <span className="whitespace-nowrap">
                  {sortOption === 'newest' && 'Latest First'}
                  {sortOption === 'oldest' && 'Oldest First'}
                  {sortOption === 'alphabetical' && 'A to Z'}
                  {sortOption === 'reverseAlphabetical' && 'Z to A'}
                </span>
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={clearFilters}
                >
                  <X size={16} className="mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Project grid or empty state */}
        <AnimatePresence mode="wait">
          {filteredProjects.length > 0 ? (
            <motion.div
              key="projects-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <ProjectCard 
                    project={project} 
                    shareableLink={generateProjectLink(project)} 
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 sm:py-12"
            >
              <div className="bg-gray-800/50 p-6 sm:p-8 rounded-xl shadow-xl max-w-md mx-auto backdrop-blur-sm">
                <div className="flex justify-center mb-4">
                  <Search size={48} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">No projects found</h3>
                <p className="text-gray-400 mb-4">
                  Try adjusting your search to find what you are looking for.
                </p>
                <Button 
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Clear all filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Projects;