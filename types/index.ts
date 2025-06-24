import { ReactNode } from "react";

export interface Profile {
  name: string;
  title: string;
  about: string;
  photoURL: string;
  linkedinURL?: string;
  twitterURL?: string;
  instagramURL?: string;
  githubURL?: string;
  upworkURL?: string;
  email?: string;
  phone?: string;
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
  date?: Date | string;
  isFeatured?: boolean;
  link?: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  feedback?: {
    helpful: boolean;
  };
}

export interface Feedback {
  helpful: boolean;
  timestamp: number;
  messageId: string;
}

export interface ChatSession {
  id: string;
  startTime: number;
  endTime?: number;
  userEmail: string;
  userName: string; 
  messages: Message[];
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenSize: string;
  };
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | 'Present';
  description: string;
  technologies: string[];
  companyLogo?: string;
  order: number;
}