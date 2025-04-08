# System Patterns: app-dash

## Architecture Overview

app-dash follows a component-based architecture built on Next.js and React. The system is structured around a core dashboard container that loads and manages individual application components, with authentication and settings management integrated throughout.

```
┌─────────────────────────────────────────────────┐
│                   Dashboard                      │
├─────────┬─────────────────────────────────────┐ │
│         │                                     │ │
│         │                                     │ │
│ Sidebar │            Active App               │ │
│  with   │                                     │ │
│  Auth   │                                     │ │
│ Status  │                                     │ │
├─────────┴─────────────────────────────────────┤ │
│                Settings (Dialog)               │ │
└─────────────────────────────────────────────┬───┘
            ┌───────────────┬───────────────┐
            ▼               ▼               ▼
    ┌───────────────┬───────────────┬───────────────┐
    │     LLM       │     arXiv     │    Zotero     │
    │ Conversation  │    Browser    │    Clone      │
    └───────────────┘└───────────────┘└───────────────┘
            ▼               ▼               ▼
    ┌───────────────┬───────────────┬───────────────┐
    │  PDF Viewer   │  Transcribe   │     Code      │
    │               │    Notes      │  Complexity   │
    └───────────────┘└───────────────┘└───────────────┘
            ▼               ▼               ▼ 
    ┌───────────────┬───────────────┬───────────────┐
    │  Video Viewer │   3D Canvas   │   Terminal    │
    │               │               │               │
    └───────────────┘└───────────────┘└───────────────┘
            ▼               ▼               
    ┌───────────────┬───────────────┐
    │     Debug     │    Console    │
    │               │               │
    └───────────────┘└───────────────┘
```

## Key Design Patterns

### Container Pattern
The Dashboard component acts as a container that:
- Manages the global state
- Handles navigation between apps
- Controls the sidebar visibility
- Renders the currently active application
- Manages authentication state
- Provides access to the settings dialog

### Authentication Pattern
The system uses NextAuth.js for authentication:
- Session provider wraps the application
- Protected routes redirect unauthenticated users
- User information is displayed in the sidebar
- Authenticated API calls can be made with session tokens

### Component Registry Pattern
Applications are registered in the dashboard through an array of app definitions:
```typescript
const apps = [
  { id: 'llm', name: 'LLM Conversation', icon: MessageSquare, component: LLMConversation },
  { id: 'arxiv', name: 'arXiv Browser', icon: FileSearch, component: ArXivBrowser },
  { id: 'zotero', name: 'Zotero Clone', icon: BookMarked, component: ZoteroClone },
  { id: 'pdf', name: 'PDF Viewer', icon: FileScan, component: PDFViewer },
  // Additional apps...
]
```
This pattern enables:
- Dynamic navigation generation
- Declarative app registration
- Easy addition of new applications
- Consistent icon usage
- Type safety for application definitions

### Settings Management
The application uses a context-based settings architecture:
1. Settings are defined in a strongly-typed schema
2. A React context provides global access to settings state
3. Settings are organized in a three-level hierarchy (categories, sections, individual settings)
4. A dedicated provider (SettingsProvider) wraps the application
5. Settings are persisted in localStorage with automatic loading
6. Multiple setting types support different data requirements

### State Management
The system follows these patterns for state management:

1. **Dashboard State**:
   - Tracks active application
   - Manages sidebar visibility
   - Controls settings dialog visibility
   - Maintains authentication state

2. **Application State**:
   - Each app component maintains its own state
   - State is isolated to prevent cross-app interference
   - Components can access global settings via context
   - Components can access authentication state via useSession

3. **Settings State**:
   - Centralized in a React context
   - Schema-driven with strong typing
   - Structured in a hierarchy for organization
   - Includes helper functions for updating and resetting
   - Persisted to localStorage

### UI Component Patterns
The UI follows shadcn/ui patterns, which provides:
- Consistent styling through utility-based design
- Accessibility built into components
- Flexible composition of complex UI elements from primitive components
- Common patterns for dialogs, buttons, forms, and navigation

## Component Relationships

### Dashboard → Auth → App Components
- The dashboard checks authentication status before rendering components
- Protected routes and components redirect unauthenticated users
- User information is displayed in the sidebar

### Dashboard → App Components
- The dashboard renders the currently active app component
- It passes settings and potentially other context to the app
- Apps are loaded dynamically based on user selection

### App Components → UI Components
- Each app composes its interface from shadcn/ui components
- Apps maintain internal component hierarchies as needed
- Common UI elements (buttons, inputs, etc.) are standardized

### Settings Dialog → Settings Configuration
- The settings dialog creates a form based on the configuration schema
- It updates the central settings state when changes are saved
- Each app receives updated settings through the settings context
- Settings dialog provides search, reset, and organization capabilities

## Data Flow

```
┌──────────────┐         ┌──────────────┐
│   User       │◄────────┤    Auth      │
│ Interaction  │         │    State     │
└──────┬───────┘         └──────▲───────┘
       │                        │
       ▼                        │
┌──────────────┐         ┌──────────────┐
│  Dashboard   │─────────►   Settings   │
│   State      │         │    State     │
└──────┬───────┘         └──────▲───────┘
       │                        │
       ▼                        │
┌──────────────┐         ┌──────────────┐
│   Active     │─────────►  App-specific│
│     App      │         │   Settings   │
└──────────────┘         └──────────────┘
```

## Extensibility Mechanisms

The system is designed for extensibility through:

1. **App Registry**: New applications can be added to the apps array
2. **Settings Schema**: The settings system can accommodate new application configurations
3. **Component-Based Design**: New functionality can be added by creating new components that follow established patterns
4. **Consistent UI Library**: New UIs can be built rapidly using the existing component library
5. **Authentication Integration**: New components can access authentication state consistently

## Technical Constraints

- Each app must export a React component that accepts standardized props
- Apps should respect the design system and UX patterns
- State should be managed locally unless it needs to be shared
- Settings should follow the established namespace pattern
- Authentication should be checked where required
- API keys should be stored securely (currently in client, potentially should move server-side)

## Authentication Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    Login     │────────►│  NextAuth.js │────────►│   Session    │
│    Request   │         │    Handler   │         │    Created   │
└──────────────┘         └──────────────┘         └──────┬───────┘
                                                          │
                                                          ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Protected  │◄────────┤  Session     │◄────────┤   User       │
│   Content    │         │  Validation  │         │  Redirected  │
└──────────────┘         └──────────────┘         └──────────────┘
                                ▲
                                │
┌──────────────┐         ┌──────────────┐
│    Logout    │────────►│   Session    │
│    Request   │         │  Destroyed   │
└──────────────┘         └──────────────┘
```

## Settings System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                      Settings Schema                           │
│                                                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │  Category   │    │  Category   │    │  Category   │       │
│  │  (General)  │    │   (Apps)    │    │ (Advanced)  │       │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘       │
│         │                  │                  │              │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐       │
│  │  Sections   │    │  Sections   │    │  Sections   │       │
│  │ (Appearance,│    │ (LLM, arXiv,│    │(Performance,│       │
│  │  Behavior)  │    │ Zotero, etc)│    │Security,etc)│       │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘       │
│         │                  │                  │              │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐       │
│  │  Settings   │    │  Settings   │    │  Settings   │       │
│  │ (Individual │    │ (Individual │    │ (Individual │       │
│  │  settings)  │    │  settings)  │    │  settings)  │       │
│  └─────────────┘    └─────────────┘    └─────────────┘       │
└───────────────────────────────────────────────────────────────┘
                               │
                        ┌──────▼──────┐
                        │   Context   │
                        │  Provider   │
                        └──────┬──────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
      ┌───────▼─────┐  ┌───────▼─────┐  ┌───────▼─────┐
      │ Component 1 │  │ Component 2 │  │ Component 3 │
      └─────────────┘  └─────────────┘  └─────────────┘
```

## Application Component Pattern

Each application component follows a similar pattern:

```
┌────────────────────────────────────────────────┐
│               Application Component             │
│                                                │
│  ┌─────────────────┐     ┌─────────────────┐   │
│  │    UI Header    │     │  Settings Hook  │   │
│  └─────────────────┘     └─────────────────┘   │
│                                                │
│  ┌─────────────────┐     ┌─────────────────┐   │
│  │  Main Content   │     │  Session Hook   │   │
│  └─────────────────┘     └─────────────────┘   │
│                                                │
│  ┌─────────────────┐     ┌─────────────────┐   │
│  │  Control Panel  │     │   Local State   │   │
│  └─────────────────┘     └─────────────────┘   │
│                                                │
└────────────────────────────────────────────────┘
```

This structure enables:
- Consistent user experience across applications
- Reuse of common patterns and components
- Easy integration with central services (settings, authentication)
- Clear separation of concerns within each app