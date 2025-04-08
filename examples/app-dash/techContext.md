# Technical Context: app-dash

## Technology Stack

### Core Technologies
- **Next.js 14.2.12**: React framework for building the application
- **React 18**: UI library for component-based development
- **TypeScript**: Static typing for improved code quality
- **Tailwind CSS 3.4.1**: Utility-first CSS framework for styling

### UI Components
- **shadcn/ui**: Headless UI component library
- **Radix UI**: Accessible primitives for UI components
- **Lucide React 0.441.0**: Icon library

### Authentication
- **NextAuth.js**: Authentication solution for Next.js
- Multiple authentication provider support
- Session management

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting (inferred from settings)

## Project Setup

### Directory Structure
```
app-dash/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard.tsx
│   │   │   ├── llm-conversation.tsx
│   │   │   ├── pdf-viewer.tsx
│   │   │   ├── arxiv-browser.tsx
│   │   │   ├── zotero-clone.tsx
│   │   │   ├── code-complexity.tsx
│   │   │   ├── smart-video-viewer.tsx
│   │   │   ├── 3dcanvas.tsx
│   │   │   ├── terminal.tsx
│   │   │   ├── debug.tsx
│   │   │   ├── console.tsx
│   │   │   └── settings/
│   │   │       ├── settings-dialog.tsx
│   │   │       └── settings components...
│   │   ├── contexts/
│   │   │   └── settings-context.tsx
│   │   ├── config/
│   │   │   └── settings-schema.ts
│   │   ├── fonts/
│   │   │   ├── GeistVF.woff
│   │   │   └── GeistMonoVF.woff
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── avatar.tsx
│   │       ├── dialog.tsx
│   │       ├── scroll-area.tsx
│   │       └── other ui components...
│   └── lib/
│       └── utils.ts
├── public/
│   ├── placeholder.svg
│   └── other assets...
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### Key Files
- **page.tsx**: Entry point for the application
- **dashboard.tsx**: Main dashboard component with app navigation
- **llm-conversation.tsx**: LLM conversation application component
- **settings-context.tsx**: Context provider for global settings
- **settings-schema.ts**: Schema for all application settings
- **settings-dialog.tsx**: Main settings dialog component
- **globals.css**: Global styles and Tailwind imports

## Technical Dependencies

### Front-end Dependencies
```json
{
  "dependencies": {
    "@radix-ui/react-alert": "1.1.1",
    "@radix-ui/react-avatar": "1.1.1",
    "@radix-ui/react-checkbox": "1.1.1",
    "@radix-ui/react-dialog": "1.1.1",
    "@radix-ui/react-icons": "1.3.0",
    "@radix-ui/react-label": "2.1.0",
    "@radix-ui/react-scroll-area": "1.1.0",
    "@radix-ui/react-select": "2.1.1",
    "@radix-ui/react-slider": "1.2.0",
    "@radix-ui/react-slot": "1.1.0",
    "@radix-ui/react-switch": "1.1.0",
    "@radix-ui/react-tabs": "1.1.0",
    "@radix-ui/react-tooltip": "1.1.2",
    "class-variance-authority": "0.7.0",
    "clsx": "2.1.1",
    "lucide-react": "0.445.0",
    "next": "14.2.13",
    "next-auth": "^4.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "2.5.2",
    "tailwindcss-animate": "1.0.7"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@shadcn/ui": "0.0.4",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.12",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

## Component Architecture

### UI Components
The UI is built using shadcn/ui components, which are styled using Tailwind CSS and built on top of Radix UI primitives. This approach provides:

- Consistent styling
- Accessibility out of the box
- Customizable components
- Server component compatibility

### App Components
Each application in the dashboard is represented by a React component that encapsulates its functionality:

- **Dashboard**: Main container with navigation sidebar and app switching
- **LLMConversation**: Simulates conversations between AI models and users
- **ArXivBrowser**: Interface for browsing arXiv papers
- **ZoteroClone**: Reference management functionality
- **PDFViewer**: PDF viewing and annotation
- **TranscribeNotes**: Handwritten note transcription
- **CodeComplexity**: Code complexity analysis
- **VideoViewer**: Enhanced video playback
- **Canvas3d**: 3D visualization
- **Terminal**: Terminal emulation
- **Debug**: Debugging tools with API request logging and testing utilities
  - Displays system information
  - API Request Logs with auto-updating functionality
  - Detailed view for log entries
  - Test utility for all API connections
- **Console**: Console output and interaction

### Settings Components
The settings system is built with several specialized components:

- **SettingsProvider**: Context provider for global settings state
- **SettingsDialog**: Main dialog with tabs and search functionality
- **SettingsCategory**: Groups related settings sections
- **SettingsSection**: Groups related settings with reset capability
- **SettingItem**: Renders the appropriate input for each setting type

### Authentication Components
The authentication is handled with NextAuth.js:

- **Session Provider**: Provides session context to the application
- **Authentication Guards**: Protect routes from unauthorized access
- **Login/Logout Components**: Handle user authentication

### Data Flow
The application uses a combination of state management approaches:
- useState for local component state
- React Context API for global settings state
- NextAuth for authentication state
- Custom hooks (useSettings, useSession) for accessing state throughout the app
- Schema-driven approach for strongly typed settings

## Development Environment

### Setup Requirements
1. Node.js (at least v18 based on Next.js version)
2. npm, yarn, or pnpm for package management

### Running the Application
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## API Integrations

The application is designed to integrate with various APIs:

1. **Authentication**: 
   - NextAuth.js with various providers
   - OAuth authentication flow

2. **LLM Conversation**: 
   - OpenAI API (configuration in settings)
   - Anthropic API (with validation and testing)
   - Google Gemini API (with validation and testing)
   - Deepseek API (with validation and testing)
   - OpenRouter API (with validation and testing)
   - Requesty API (with validation and testing)
   - Ollama (local LLM options)
   
3. **API Testing and Logging**:
   - Comprehensive API request/response logging
   - Automatic updates when logs change
   - Test connection functionality for all providers
   - Batch testing utility for all configured APIs
   - Timeout handling for API connections
   - Error handling with detailed error messages

3. **arXiv Browser**:
   - arXiv API for paper retrieval
   - Potential for additional metadata sources

4. **Zotero Clone**:
   - Zotero API for reference management
   - Potential for citation service integrations

5. **PDF Viewer**:
   - PDF.js for rendering
   - Potential OCR services

6. **Code Complexity**:
   - Various code analysis APIs
   - Potential GitHub integration

7. **Video Viewer**:
   - Video processing APIs
   - Transcript generation services

## Browser Compatibility

The application uses modern web standards and should be compatible with:
- Recent versions of Chrome, Firefox, Safari, and Edge
- Mobile browsers (with responsive design)

## Performance Considerations

1. Dynamic loading of app components when selected
2. Potential for caching API results
3. Efficient rendering with React
4. Optimized styling with Tailwind CSS
5. Client-side navigation for faster transitions

## Security Considerations

1. Authentication handled by NextAuth.js
2. API key validation improvements:
   - Standardized logging across all providers (OpenAI, Anthropic, Google, OpenRouter, Deepseek, Requesty)
   - API keys masked in logs (shows only last 4 characters)
   - Detailed request/response logging for validation attempts
3. API keys stored in client side (potentially should be moved to a secure backend)
4. Local storage used for settings (consider encrypted storage for sensitive data)
5. Consider implementing server-side API proxies for secure API access

## Deployment Strategy

The application can be deployed using various Next.js deployment options:
- Vercel (optimized for Next.js)
- Netlify
- Static export for simple hosting
- Node.js server for full SSR capabilities