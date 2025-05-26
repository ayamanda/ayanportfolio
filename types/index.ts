import { ReactNode } from "react";

export interface Profile {
  [x: string]: string | undefined;
  twitterURL: string | undefined;
  linkedinURL: string | undefined;
  name: string;
  title: string;
  photoURL: string;
  about: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  slug?: string;
  coverPhoto: string;
  buttonLink?: string;
  buttonType?: string;
  icon?: string;
  color?: string;
  tags?: string[];
  date?: any;
  isFeatured?: boolean;
  link?: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: any;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  feedback?: Feedback;
}

export interface Feedback {
  helpful: boolean;
  timestamp: number;
  messageId: string;
}

export interface ChatSession {
  id: string;
  startTime: number;
  userEmail: string;
  userName: string; 
  messages: Message[];
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenSize: string;
  };
}