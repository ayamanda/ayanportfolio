import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { Project } from '../../types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as LucideIcons from 'lucide-react';
import Loader from '../Loader';

export const ProjectsSection: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const { register, handleSubmit, reset, setValue, watch } = useForm<Project>();
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const coverPhoto = watch('coverPhoto');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'projects'));
            const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            setProjects(projectsData);
        } catch (error) {
            toast.error('Failed to fetch projects. Please try again.');
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: Project) => {
        try {
            const projectData = {
                name: data.name,
                description: data.description,
                icon: data.icon,
                color: data.color,
                buttonType: data.buttonType,
                buttonLink: data.buttonLink,
                coverPhoto: data.coverPhoto
            };

            if (editingProject) {
                await updateDoc(doc(db, 'projects', editingProject.id), projectData);
                toast.success('Project updated successfully!');
            } else {
                await addDoc(collection(db, 'projects'), projectData);
                toast.success('Project added successfully!');
            }
            reset();
            setEditingProject(null);
            fetchProjects();
        } catch (error) {
            toast.error('Failed to perform project operation. Please try again.');
            console.error('Project operation failed:', error);
        }
    };

    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        const storageRef = ref(storage, `projects/${file.name}`);

        try {
            setUploading(true);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            setValue('coverPhoto', downloadURL);
            toast.success('File uploaded successfully!');
        } catch (error) {
            toast.error('Failed to upload project cover photo. Please try again.');
            console.error('File upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        reset(project);
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

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Projects</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
                <input {...register('name')} placeholder="Project Name" className="w-full p-2 bg-gray-700 rounded" />
                <textarea {...register('description')} placeholder="Project Description" className="w-full p-2 bg-gray-700 rounded" rows={4} />
                <select {...register('icon')} className="w-full p-2 bg-gray-700 rounded">
                    {Object.keys(LucideIcons).map((iconName) => (
                        <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                </select>
                <select {...register('color')} className="w-full p-2 bg-gray-700 rounded">
                    <option value="from-pink-500 to-violet-500">Pink to Violet</option>
                    <option value="from-cyan-500 to-blue-500">Cyan to Blue</option>
                    <option value="from-green-500 to-emerald-500">Green to Emerald</option>
                </select>
                <select {...register('buttonType')} className="w-full p-2 bg-gray-700 rounded">
                    <option value="download">Download</option>
                    <option value="redirect">Redirect</option>
                </select>
                <input {...register('buttonLink')} placeholder="Button Link" className="w-full p-2 bg-gray-700 rounded" />
                <div {...getRootProps()} className="border-2 border-dashed border-gray-600 p-4 rounded text-center cursor-pointer">
                    <input {...getInputProps()} />
                    <p>Drag & drop project cover photo or click to select</p>
                </div>
                {coverPhoto && (
                    <img src={coverPhoto} alt="Cover" className="w-full h-40 object-cover rounded" />
                )}
                <button type="submit" className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700" disabled={uploading}>
                    {uploading ? 'Uploading...' : editingProject ? 'Update Project' : 'Add Project'}
                </button>
            </form>

            {loading ? (
                <Loader/>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => {
                        const Icon = LucideIcons[project.icon as keyof typeof LucideIcons] as React.ComponentType<{ size?: number; className?: string }>;
                        return (
                            <div key={project.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                                {project.coverPhoto && (
                                    <img src={project.coverPhoto} alt={project.name} className="w-full h-40 object-cover rounded-t-lg mb-4" />
                                )}
                                <div className="flex items-center mb-2">
                                    {Icon && <Icon size={24} className={`text-transparent bg-clip-text bg-gradient-to-r ${project.color} mr-2`} />}
                                    <h3 className="text-xl font-semibold">{project.name}</h3>
                                </div>
                                <p className="mb-4 text-gray-300">{project.description}</p>
                                <div className="flex justify-between items-center">
                                    <button 
                                        className={`px-4 py-2 rounded text-white bg-gradient-to-r ${project.color}`}
                                        onClick={() => window.open(project.buttonLink, '_blank')}
                                    >
                                        {project.buttonType === 'download' ? 'Download' : 'View'}
                                    </button>
                                    <div>
                                        <button onClick={() => handleEdit(project)} className="text-blue-500 mr-2">Edit</button>
                                        <button onClick={() => handleDelete(project.id)} className="text-red-500">Delete</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};