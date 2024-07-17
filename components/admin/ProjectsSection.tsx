import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { Project } from '../../types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownToLine, Link, Loader2, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type ButtonType = 'download' | 'redirect';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline','strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image'
];

export const ProjectsSection: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const { control, register, handleSubmit, reset, setValue, watch } = useForm<Project>();
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [featuredProjectId, setFeaturedProjectId] = useState<string | null>(null);

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
            const featuredProject = projectsData.find(project => project.isFeatured);
            setFeaturedProjectId(featuredProject ? featuredProject.id : null);
        } catch (error) {
            toast.error('Failed to fetch projects. Please try again.');
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: Project) => {
        try {
            // Ensure the link starts with http:// or https://
            let link = data.buttonLink;
            if (!link.startsWith('http://') && !link.startsWith('https://')) {
                link = 'http://' + link;
            }

            const projectData = {
                name: data.name,
                description: data.description,
                buttonType: data.buttonType,
                buttonLink: link,  // Use the corrected link here
                coverPhoto: data.coverPhoto,
                isFeatured: data.isFeatured || false
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

    const handleSetFeatured = async (projectId: string) => {
        try {
            // Unset the previously featured project
            if (featuredProjectId) {
                await updateDoc(doc(db, 'projects', featuredProjectId), { isFeatured: false });
            }
            
            // Set the new featured project
            await updateDoc(doc(db, 'projects', projectId), { isFeatured: true });
            
            setFeaturedProjectId(projectId);
            toast.success('Featured project updated successfully!');
            fetchProjects();
        } catch (error) {
            toast.error('Failed to update featured project. Please try again.');
            console.error('Failed to update featured project:', error);
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

    const truncateDescription = (html: string, maxLength: number) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold">Projects</h2>
            <Card className="bg-gray-800 text-white border-gray-700">
                <CardHeader>
                    <CardTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input {...register('name')} placeholder="Project Name" className="bg-gray-700 border-gray-600" />
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <ReactQuill 
                                    theme="snow"
                                    value={field.value} 
                                    onChange={field.onChange}
                                    modules={modules}
                                    formats={formats}
                                />
                            )}
                        />
                        <Select onValueChange={(value: ButtonType) => setValue('buttonType', value)}>
                            <SelectTrigger className="bg-gray-700 border-gray-600">
                                <SelectValue placeholder="Select button type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-gray-600 hover:bg-gray-700">
                                <SelectItem value="download">Download</SelectItem>
                                <SelectItem value="redirect">Redirect</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input {...register('buttonLink')} placeholder="Button Link" className="bg-gray-700 border-gray-600" />
                        <div {...getRootProps()} className="border-2 border-dashed border-gray-600 p-4 rounded text-center cursor-pointer">
                            <input {...getInputProps()} />
                            <p>Drag & drop project cover photo or click to select</p>
                        </div>
                        {coverPhoto && (
                            <img src={coverPhoto} alt="Cover" className="w-full h-40 object-cover rounded" />
                        )}
                    </form>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSubmit(onSubmit)} disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700">
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {uploading ? 'Uploading...' : editingProject ? 'Update Project' : 'Add Project'}
                    </Button>
                </CardFooter>
            </Card>

            {loading ? (
                <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Card key={project.id} className="bg-gray-800 text-white border-gray-700">
                            <CardHeader>
                                {project.coverPhoto && (
                                    <img src={project.coverPhoto} alt={project.name} className="w-full h-40 object-cover rounded-t-lg" />
                                )}
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center space-x-2">
                                        {project.buttonType === 'download' ? <ArrowDownToLine className="h-5 w-5" /> : <Link className="h-5 w-5" />}
                                        <span>{project.name}</span>
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-300">{truncateDescription(project.description, 100)}</p>
                                <Button variant="link" className='text-orange-300' onClick={() => setSelectedProject(project)}>Read More</Button>
                                <div className="mt-4">
                                    <RadioGroup defaultValue={featuredProjectId || undefined} onValueChange={(value) => handleSetFeatured(value)}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value={project.id} id={`featured-${project.id}`} />
                                            <Label htmlFor={`featured-${project.id}`}>Featured Project</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button 
                                    variant="outline"
                                    onClick={() => window.open(project.buttonLink, '_blank')}
                                    className="bg-gray-700 hover:bg-gray-600 border-gray-600"
                                >
                                    {project.buttonType === 'download' ? 'Download' : 'View'}
                                </Button>
                                <div>
                                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300 mr-2" onClick={() => handleEdit(project)}>Edit</Button>
                                    <Button variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(project.id)}>Delete</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
                <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{selectedProject?.name}</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[60vh]">
                        <DialogDescription>
                            <div dangerouslySetInnerHTML={{ __html: selectedProject?.description || '' }} />
                        </DialogDescription>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
};