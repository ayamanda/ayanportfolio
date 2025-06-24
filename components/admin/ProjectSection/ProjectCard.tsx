import React from 'react';
import { Project } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowDownToLine, Link } from 'lucide-react';
import Image from 'next/image';

interface ProjectCardProps {
    project: Project;
    featuredProjectId: string | null;
    onSetFeatured: (projectId: string) => void;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
    onReadMore: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
    featuredProjectId,
    onSetFeatured,
    onEdit,
    onDelete,
    onReadMore
}) => {
    const truncateDescription = (html: string, maxLength: number) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
                {project.coverPhoto && (
                    <div className="relative w-full h-40 bg-gray-700 rounded-t-lg">
                        <Image 
                            src={project.coverPhoto} 
                            alt={project.name} 
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover rounded-t-lg"
                            onError={(e) => {
                                // Hide the image on error and show a fallback background
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    </div>
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
                <Button variant="link" className='text-orange-300' onClick={onReadMore}>Read More</Button>
                <div className="mt-4">
                    <RadioGroup 
                        defaultValue={featuredProjectId || undefined} 
                        onValueChange={(value) => onSetFeatured(value)}
                    >
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
                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300 mr-2" onClick={() => onEdit(project)}>Edit</Button>
                    <Button variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => onDelete(project.id)}>Delete</Button>
                </div>
            </CardFooter>
        </Card>
    );
};