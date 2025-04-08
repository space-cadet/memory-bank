# Authentication Layer Design Plan

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  UI Components                   │
│  (Login, Signup, Dashboard, Profile Management)  │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│             Auth Context Provider                │
│    (User state, Auth methods, Child profiles)    │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│               Auth Services                      │
│           (Implementation-agnostic)              │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│           Auth Provider Adapters                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │   Mock   │  │   JSON   │  │   Firebase   │   │
│  │  Storage │  │  Server  │  │     Auth     │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────────────────────────────┘
```

## Core Components

### 1. Auth Service Interface

Define a clear interface for auth operations that any implementation must satisfy:

- User authentication (login, signup, logout)
- Password management (reset, change)
- Session management (check auth state, refresh tokens)
- User profile operations (get, update)
- Child profile operations (create, read, update, delete)
- Preference management
- Error handling patterns

### 2. User Data Models

Create standardized data models independent of the auth provider:

- `UserProfile` - Core user information
- `AuthCredentials` - Authentication tokens and expiry
- `ChildProfile` - Child user information
- `UserPreferences` - User and application settings

### 3. Auth Provider Adapters

Implement provider-specific adapters that conform to the service interface:

- `MockAuthAdapter` - Uses localStorage (current implementation)
- `JsonServerAdapter` - Connects to JSON Server API
- `FirebaseAuthAdapter` - Would use Firebase authentication

### 4. Auth Configuration System

Create a configuration system that allows:

- Selection of auth provider at runtime
- Provider-specific settings
- Environment-specific configurations (dev/test/prod)

### 5. React Auth Context

Enhance the existing AuthProvider to:

- Connect to the selected auth adapter
- Manage authentication state
- Provide consistent API to components
- Handle loading and error states

## Implementation Strategy

### Phase 1: Refactor Current Implementation

1. Extract current localStorage auth logic into a `MockAuthAdapter`
2. Define the auth service interface based on current needs
3. Update AuthProvider to use the adapter through the interface
4. Ensure all existing functionality works with this abstraction

### Phase 2: Add JSON Server Implementation

1. Set up JSON Server with appropriate data structure
2. Implement `JsonServerAdapter` following the same interface
3. Add configuration to switch between adapters
4. Test with both adapters to ensure consistent behavior

### Phase 3: Prepare for Future Providers

1. Document the interface for adding new auth providers
2. Create migration tools between providers if needed
3. Add hooks for provider-specific features while maintaining core interface

## Testing Strategy

1. Unit tests for each adapter to ensure they meet the interface requirements
2. Integration tests for AuthProvider with different adapters
3. E2E tests for critical auth flows
4. Manual testing across browsers and sessions

## Key Design Considerations

- **Provider agnostic error handling**: Standardize error formats across providers
- **State persistence**: Consistent approach to session management
- **Asynchronous operations**: All auth operations should be Promise-based
- **Type safety**: Use TypeScript interfaces to enforce adapter compliance
- **Configuration fallbacks**: Graceful degradation if a provider is unavailable

This architecture allows for flexible auth provider switching while maintaining a consistent interface for the rest of the application. The abstraction layer ensures that UI components don't need to change when the underlying auth implementation changes.
