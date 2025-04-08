# Technical Context: Sayu Unified App

## Tech Stack

### Frontend Framework
- **Next.js 15**: App Router for file-based routing and server components
- **React 19**: Latest version with hooks and concurrent rendering features
- **TypeScript**: For type safety and improved developer experience

### Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Tailwind Animate**: Animation utilities for Tailwind
- **CSS Variables**: For theme customization
- **class-variance-authority**: For component variants
- **tailwind-merge**: For merging Tailwind classes

### UI Components
- **Radix UI**: Accessible, unstyled component primitives
- **shadcn/ui**: Component collection built on Radix UI
- **Lucide React**: Icon library
- **Framer Motion**: Advanced animations and transitions

### State Management
- **React Context API**: For global state management
- **Custom Hooks**: For reusable stateful logic
- **Local Storage**: For persisting user preferences and progress

### Package Management
- **pnpm**: For efficient dependency management

### Development Tools
- **ESLint**: For code linting
- **Prettier**: For code formatting
- **TypeScript**: For static type checking

## Development Environment

### Requirements
- **Node.js**: v18 or later
- **pnpm**: Latest version
- **Modern browser**: Chrome, Firefox, Safari, or Edge

### Commands
- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Run production build
- `pnpm lint`: Run ESLint

## Project Structure

```
/src
  /app                   # Next.js App Router
    /(auth)              # Auth route group
      /login
      /signup
    /(dashboard)         # Dashboard route group
      /dashboard
    layout.tsx           # Root layout
    page.tsx             # Landing page
  /components
    /auth                # Auth components
    /landing             # Landing page components
    /ui                  # UI components
    theme-provider.tsx   # Theme provider
  /lib
    utils.ts             # Utility functions
  /styles                # Global styles
/public                  # Static assets
/memory-bank             # Project documentation
```

## Integration Constraints

### Animal Sounds Module
- Speech synthesis API dependency
- Image assets for animals
- Animation dependencies (Framer Motion)

### Typing Tutor Module
- Custom keyboard interaction handling
- Lesson progression system
- User input validation logic

## Technical Decisions

### App Router vs Pages Router
**Decision**: Use App Router for newer features and better organization
**Rationale**: Allows for more organized route groups and better data fetching patterns

### Authentication Strategy
**Decision**: Start with mock auth in localStorage, design for easy replacement
**Rationale**: Speeds development while maintaining flexibility for future auth providers

### Styling Approach
**Decision**: Use Tailwind with shadcn/ui-style components
**Rationale**: Combines utility classes with component abstraction for maintainability

### State Management
**Decision**: Use React Context for global state
**Rationale**: Sufficient for current needs without adding external dependencies

## Performance Considerations

- **Code Splitting**: Split code by route for faster initial load
- **Image Optimization**: Use Next.js image optimization
- **Animation Performance**: Monitor and optimize animation performance for low-end devices
- **Bundle Size**: Keep dependencies minimal, use tree-shaking

## Accessibility Requirements

- **Semantic HTML**: Use appropriate elements for content
- **Keyboard Navigation**: Ensure all interactions are keyboard accessible
- **Screen Reader Support**: Include proper ARIA attributes
- **Color Contrast**: Maintain sufficient contrast ratios
- **Focus Management**: Visible focus indicators for keyboard users

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Browsers**: Safari iOS, Chrome Android
- **No IE Support**: Not supporting Internet Explorer

## Deployment Considerations

- **Static Export**: Option for static site generation
- **Vercel Deployment**: Primary deployment target
- **Environment Variables**: Configuration via environment variables
