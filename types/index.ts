import { ReactNode } from "react";

export interface Profile {
  tagline: ReactNode;
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