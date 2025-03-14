import React from 'react';
import { Project } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';

interface ProjectDialogProps {
    project: Project | null;
    onClose: () => void;
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({ project, onClose }) => {
    if (!project) return null;

    return (
        <Dialog open={!!project} onOpenChange={onClose}>
            <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{project.name}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                    <div className="space-y-4">
                        {project.coverPhoto && (
                            <Image src={project.coverPhoto} alt={project.name} className="w-full h-64 object-cover rounded" />
                        )}
                        <div dangerouslySetInnerHTML={{ __html: project.description || '' }} />
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};