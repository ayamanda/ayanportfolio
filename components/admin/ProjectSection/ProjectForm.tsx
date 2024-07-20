import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase';
import { Project } from '@/types';
import { toast } from 'react-toastify';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
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

interface ProjectFormProps {
    editingProject: Project | null;
    onProjectSubmitted: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ editingProject, onProjectSubmitted }) => {
    const { control, register, handleSubmit, reset, setValue, watch } = useForm<Project>();
    const [uploading, setUploading] = useState(false);

    const coverPhoto = watch('coverPhoto');

    useEffect(() => {
        if (editingProject) {
            reset(editingProject);
        }
    }, [editingProject, reset]);

    const onSubmit = async (data: Project) => {
        try {
            let link = data.buttonLink;
            if (!link.startsWith('http://') && !link.startsWith('https://')) {
                link = 'http://' + link;
            }

            const projectData = {
                name: data.name,
                description: data.description,
                buttonType: data.buttonType,
                buttonLink: link,
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
            
            clearForm();
            onProjectSubmitted();
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

    const clearForm = () => {
        reset({
            name: '',
            description: '',
            buttonType: undefined,
            buttonLink: '',
            coverPhoto: '',
            isFeatured: false
        });
    };

    return (
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
            <CardFooter className="flex justify-between">
                <Button onClick={handleSubmit(onSubmit)} disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700">
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {uploading ? 'Uploading...' : editingProject ? 'Update Project' : 'Add Project'}
                </Button>
                <Button onClick={clearForm} className="bg-red-600 hover:bg-red-700">
                    Clear Form
                </Button>
            </CardFooter>
        </Card>
    );
};