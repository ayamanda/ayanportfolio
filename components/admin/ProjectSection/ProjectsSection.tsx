import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Project } from '../../../types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loader2 } from 'lucide-react';
import { ProjectForm } from './ProjectForm';
import { ProjectCard } from './ProjectCard';
import { ProjectDialog } from './ProjectDialog';
import { Button } from "@/components/ui/button";

export const ProjectsSection: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [featuredProjectId, setFeaturedProjectId] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'projects'));
            const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            setProjects(projectsData);
            const featuredProject = projectsData.find(project => project.isFeatured);
            setFeaturedProjectId(featuredProject ? featuredProject.id : null);
        } catch (error) {
            toast.error('Failed to fetch projects. Please try again.');
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSetFeatured = async (projectId: string) => {
        try {
            if (featuredProjectId) {
                await updateDoc(doc(db, 'projects', featuredProjectId), { isFeatured: false });
            }
            await updateDoc(doc(db, 'projects', projectId), { isFeatured: true });
            setFeaturedProjectId(projectId);
            toast.success('Featured project updated successfully!');
            fetchProjects();
        } catch (error) {
            toast.error('Failed to update featured project. Please try again.');
            console.error('Failed to update featured project:', error);
        }
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteDoc(doc(db, 'projects', id));
                toast.success('Project deleted successfully!');
                fetchProjects();
            } catch (error) {
                toast.error('Failed to delete project. Please try again.');
                console.error('Project deletion failed:', error);
            }
        }
    };

    const handleProjectSubmitted = () => {
        setEditingProject(null);
        fetchProjects();
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">Projects</h2>
            <ProjectForm 
                editingProject={editingProject} 
                onProjectSubmitted={handleProjectSubmitted}
            />
            {loading ? (
                <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            featuredProjectId={featuredProjectId}
                            onSetFeatured={handleSetFeatured}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onReadMore={() => setSelectedProject(project)}
                        />
                    ))}
                </div>
            )}
            <ProjectDialog
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
            <Button 
                onClick={fetchProjects} 
                className="mt-4 bg-green-600 hover:bg-green-700"
            >
                Refresh Projects
            </Button>
        </div>
    );
};