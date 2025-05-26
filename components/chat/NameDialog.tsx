import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NameDialogProps {
  open: boolean;
  onSubmit: (name: string) => void;
}

export function NameDialog({ open, onSubmit }: NameDialogProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Welcome! 👋
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Please enter your name to start chatting
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="bg-gray-800 border-gray-700 text-white focus:ring-indigo-500"
            autoFocus
          />
          <Button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            Start Chat
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}