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
  isFeatured: boolean;
  buttonLink: string;
  link: string | undefined;
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  coverPhoto: string;
  buttonType: 'download' | 'redirect';
}

export interface Skill {
  level: any;
  id: string;
  name: string;
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
  endTime?: number;
  userEmail?: string;
  messages: Message[];
  deviceInfo: {
    userAgent: string;
    platform: string;
    screenSize: string;
  };
}
