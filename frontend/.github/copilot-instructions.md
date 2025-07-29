# AI Component Generator Frontend - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js 14+ frontend for an AI-driven component generator platform where users can create, preview, and export React components using AI.

## Tech Stack & Patterns
- **Framework**: Next.js 14+ with App Router and TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: Zustand for client-side state
- **Code Editor**: Monaco Editor for syntax highlighting
- **Authentication**: JWT-based with secure session management
- **Component Preview**: Iframe sandbox for secure component rendering

## Key Features to Implement
1. **Authentication System**: Login/signup with JWT tokens
2. **Chat Interface**: Side-panel chat with AI integration
3. **Component Preview**: Live preview in iframe sandbox
4. **Code Editor**: Syntax-highlighted JSX/TSX and CSS tabs
5. **Export Functionality**: Copy and download component code
6. **Session Management**: Auto-save and resume functionality

## Coding Guidelines
- Use TypeScript strictly with proper type definitions
- Follow Next.js App Router patterns (server/client components)
- Implement responsive design with Tailwind CSS
- Use Shadcn/ui components for consistent UI
- Create reusable custom hooks for API calls
- Implement proper error handling and loading states
- Use Zustand for state management with persistence
- Follow accessibility best practices (ARIA roles, keyboard navigation)

## File Structure Patterns
- `/components` - Reusable UI components
- `/hooks` - Custom React hooks
- `/services` - API service functions  
- `/store` - Zustand store definitions
- `/types` - TypeScript type definitions
- `/utils` - Utility functions and helpers

## Security Considerations
- Sanitize all user inputs before rendering
- Use iframe sandbox for component preview isolation
- Implement proper CORS handling
- Secure JWT token storage and refresh logic
- Validate all data from external sources

## Performance Best Practices
- Use Next.js dynamic imports for code splitting
- Implement proper loading states
- Optimize images with Next.js Image component
- Use React.memo for expensive components
- Implement proper caching strategies
