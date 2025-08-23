# Agent Guidelines for DEVx.network

## Build/Lint/Test Commands

- **Dev server**: `npm run dev` (starts Next.js dev server on port 3000)
- **Build**: `npm run build` (creates production build)
- **Lint**: `npm run lint` (runs ESLint with Next.js rules)
- **Format**: `npm run format` (auto-formats with Prettier)
- **Type check**: `npx tsc --noEmit` (no test framework configured)

## Code Style Guidelines

- **Formatting**: Use tabs, no semicolons, double quotes, 100 char line width
- **React**: Use "use client" directive for client components, functional components only
- **Imports**: Prefer named imports, use @ alias for project root imports
- **TypeScript**: Strict mode enabled, use explicit types for props and state
- **Styling**: Use styled-components for CSS-in-JS, Tailwind for utility classes
- **State**: Use React hooks (useState, useEffect), avoid class components
- **Async**: Use async/await over promises, handle errors with try/catch
- **File naming**: PascalCase for components (Footer.tsx), camelCase for utilities
- **Exports**: Named exports for components, default for pages
- **Database**: Use better-sqlite3 with prepared statements for SQLite operations
- **Next.js**: Follow App Router conventions, use server/client components appropriately
