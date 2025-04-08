# System Patterns: Sayu Unified App

## Architecture Overview

The Sayu Unified App follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                  User Interface                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │
│  │   Shared    │  │   Module-   │  │  Module- │  │
│  │ Components  │  │  Specific   │  │ Specific │  │
│  │             │  │ Components  │  │   Pages  │  │
│  └─────────────┘  └─────────────┘  └──────────┘  │
├─────────────────────────────────────────────────┤
│                State Management                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │
│  │    Auth     │  │   Module    │  │  Shared  │  │
│  │   Context   │  │  Contexts   │  │  Hooks   │  │
│  └─────────────┘  └─────────────┘  └──────────┘  │
├─────────────────────────────────────────────────┤
│                   Data Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │
│  │ Local       │  │ Mock/API    │  │ Utility  │  │
│  │ Storage     │  │ Services    │  │ Functions│  │
│  └─────────────┘  └─────────────┘  └──────────┘  │
└─────────────────────────────────────────────────┘
```

## Key Design Patterns

### 1. Module Pattern
- Each learning activity (Animal Sounds, Typing Tutor) is encapsulated as a module
- Modules share common infrastructure but maintain internal cohesion
- Modules expose consistent interfaces for integration with the larger system

### 2. Context Provider Pattern
- User authentication and profile management through AuthProvider
- Module-specific state through dedicated context providers
- Context consumers access relevant state with custom hooks

### 3. Compound Component Pattern
- UI components built as composable units
- Components share state internally but present a clean API externally
- Enables consistent styling while allowing flexibility

### 4. Adapter Pattern
- Uniform interface wrapping different implementations between modules
- Allows modules developed independently to work together seamlessly
- Simplifies future integration of additional learning modules

## Component Hierarchy

```
App
├── AuthProvider
│   ├── ThemeProvider
│   │   ├── Public Routes (Landing, Login, Signup)
│   │   └── Protected Routes
│   │       ├── Dashboard (Parent/Child)
│   │       ├── AnimalSoundsModule
│   │       └── TypingTutorModule
└── Toaster
```

## State Management

### Authentication State
- User credentials and session management
- Parent profile information
- Child profiles with preferences

### Progress State
- Module completion tracking
- Achievement records
- Performance metrics

### Preference State
- Theme preferences
- Accessibility settings
- Module-specific settings

## Data Flow

1. User interaction triggers UI events
2. Events processed by component or page-level handlers
3. State updates dispatched to appropriate context
4. UI re-renders based on state changes
5. Persistent data saved to local storage
6. Local storage loaded on initialization

## Routing Strategy

- App router with route groups for organization
- Authentication-based route protection
- Nested layouts for consistent UI elements
- Dynamic routing based on selected child profile

## Theming System

- CSS variables for theme consistency
- Tailwind utility classes for component styling
- Global styles for app-wide defaults
- Component-specific styles for unique elements

## Error Handling

- Boundary components to catch and display errors
- Consistent error messaging appropriate for children
- Fallback UI for error states
- Automatic recovery when possible
