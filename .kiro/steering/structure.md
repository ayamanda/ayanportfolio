# Project Structure

## Root Directory Organization

```
├── app/                    # Next.js App Router pages and layouts
├── components/             # Reusable React components
├── lib/                    # Utility libraries and helpers
├── utils/                  # Application utilities
├── types/                  # TypeScript type definitions
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
└── langui/                 # External UI component library (subproject)
```

## App Directory (Next.js App Router)
- `app/page.tsx` - Homepage with portfolio data fetching
- `app/layout.tsx` - Root layout with metadata and analytics
- `app/admin/` - Admin dashboard pages
- `app/projects/` - Project showcase pages with dynamic routing
- `app/api/` - API routes (chat, OG image generation)

## Components Architecture

### Core Components (`components/`)
- Main portfolio sections (Home, Projects, Skills, Contact, etc.)
- Shared UI components (Header, Navbar, Loader)

### Admin Components (`components/admin/`)
- Dashboard management interfaces
- CRUD forms for portfolio content
- Organized by feature (ProjectSection/, ExperienceSection/)

### UI Components (`components/ui/`)
- Design system components built on Radix UI
- Consistent styling with CVA variants
- Reusable primitives (Button, Card, Dialog, etc.)

### Chat Components (`components/chat/`)
- AI chatbot interface components
- Message handling and display

## Key Files & Conventions

### Configuration
- `firebase.js` - Firebase initialization and exports
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.mjs` - Next.js build configuration
- `tsconfig.json` - TypeScript compiler options

### Type Definitions (`types/index.ts`)
- `Profile` - User profile data structure
- `Project` - Portfolio project model
- `Skill` - Technical skills model
- `Message` - Chat message structure
- `Experience` - Professional experience model

### Utilities
- `lib/utils.ts` - Core utility functions (cn for class merging)
- `utils/` - Application-specific utilities (themes, prompts)
- `hooks/` - Custom React hooks for Firebase and chat

## Naming Conventions
- **Components**: PascalCase (e.g., `ProjectCard.tsx`)
- **Files**: kebab-case for utilities, PascalCase for components
- **Directories**: lowercase with descriptive names
- **Types**: PascalCase interfaces exported from `types/index.ts`

## Import Patterns
- Use `@/` path alias for root-level imports
- Group imports: external libraries, internal components, types
- Prefer named exports for utilities, default exports for components