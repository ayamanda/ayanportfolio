# Technology Stack

## Core Framework
- **Next.js 14.2.4** - React framework with App Router
- **React 18** - UI library with TypeScript support
- **TypeScript 5** - Type-safe development

## Styling & UI
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Class Variance Authority (CVA)** - Component variant management
- **Tailwind Merge** - Conditional class merging utility

## Backend & Database
- **Firebase** - Authentication, Firestore database, and Storage
- **Groq SDK** - AI chat functionality
- **Edge Runtime** - Serverless API routes

## Key Libraries
- **React Hook Form** - Form management
- **React Three Fiber & Drei** - 3D graphics
- **GSAP** - Advanced animations
- **React Markdown** - Markdown rendering
- **Date-fns** - Date utilities
- **Lucide React** - Icon library

## Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Vercel Analytics** - Performance monitoring

## Common Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Package Management
npm install          # Install dependencies
npm update           # Update packages
```

## Environment Variables
- `GROQ_API_KEY` - Required for AI chat functionality
- Firebase configuration in `firebase.js`

## Build Configuration
- **Next.js Config**: Image optimization with Firebase Storage and Unsplash domains
- **TypeScript**: Strict mode enabled with path aliases (`@/*`)
- **Tailwind**: Dark mode support with custom animations