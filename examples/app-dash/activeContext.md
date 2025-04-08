# Active Context: app-dash

## Current Focus
The project is currently in the initial development phase with focus on the core dashboard structure, multiple integrated applications, and the comprehensive settings system. The dashboard layout and navigation system are functional with authentication implemented, and multiple application components have been integrated.

## Current State

### Dashboard Component
- Fully functional layout with collapsible sidebar implemented
- Navigation between all integrated applications working
- User authentication with NextAuth integrated
- User avatar and logout functionality in sidebar
- Settings access from both sidebar and header

### Authentication System
- NextAuth integration for user authentication
- Login/logout functionality implemented
- Session state management
- Avatar display with user information

### LLM Conversation Component
- Working implementation with mock data
- Support for multiple participants (both LLM and User types)
- Collapsible sidebar for participant selection
- Allows starting a conversation on a specific topic
- Enhanced settings panel with support for multiple LLM providers:
  - OpenAI
  - Anthropic
  - Google Gemini
  - Mistral
  - Ollama
  - Azure OpenAI
  - Local models
- Provider-specific configuration options
- Dynamic model selection based on provider
- Advanced generation parameters
- Quick settings button for per-conversation settings
- Ability to override global settings at conversation level
- API testing and validation for different providers
- Visual feedback on connection status
- No actual API integration yet

### PDF Viewer
- Basic implementation integrated in the dashboard
- Placeholder functionality

### Transcribe Notes
- Placeholder component integrated in the dashboard
- Ready for future implementation

### Code Complexity Calculator
- Component integrated in the dashboard structure
- Ready for implementation of code analysis features

### Smart Video Viewer
- Video playback functionality
- History tracking implementation
- Ready for more advanced features

### 3D Canvas
- 3D visualization component integrated
- Ready for implementation of 3D rendering features

### Terminal
- Basic terminal emulation functionality
- Integrated in the dashboard

### Debug & Console
- Debugging tools integrated in the dashboard
- Console component for diagnostic output
- API Request Logs card with automatic updates
- Vertical and horizontal scrolling for log display
- Detailed view when clicking on log entries
- Utility button for testing all API connections at once

### arXiv Browser
- Placeholder component integrated in the dashboard
- Ready for implementation of arXiv API integration

### Zotero Clone
- Placeholder component integrated in the dashboard
- Ready for implementation of reference management features

### Settings System
- Comprehensive settings dialog implemented with side panel navigation
- Schema-driven settings architecture with type safety
- React context-based state management for settings
- Settings persistence via localStorage
- Multiple setting types supported (text, password, switch, select, slider, color, etc.)
- Search functionality for finding specific settings
- All dashboard applications have dedicated settings sections
- Enhanced switch/toggle styling for better visual appearance
- Resizable settings dialog with custom resize handle
- Collapsible settings groups using Radix UI Collapsible component
- Provider-specific settings that conditionally render based on selection
- Improved organization with logical grouping of related settings
- API key validation with proper feedback
- Test connection functionality for API providers
- URL validation for API endpoints
- Visual feedback for validation errors
- Per-conversation settings overrides

## Active Decisions

### Implementation Approach
- Using client-side components with the "use client" directive
- Component-based structure with clear separation of concerns
- Using shadcn/ui for consistent UI components
- Mock implementations before connecting to actual APIs
- NextAuth for authentication management

### UI/UX Considerations
- Collapsible sidebar to maximize content space
- Consistent sidebar and header design across all applications
- User avatar and authentication status in sidebar
- Color-coded messages in LLM conversation for easy identification
- Consistent padding and spacing across components
- Responsive design considerations

### Settings Architecture
- Schema-driven settings system with type safety
- React Context API for global settings management
- App-based navigation with side panel organization
- Comprehensive settings for all dashboard applications
- Multiple setting types to support various input needs
- Settings persistence via localStorage with automatic loading
- Consistent styling with improved switches and UI elements

## Pending Decisions

1. **API Integration Strategy**:
   - Specific implementation details for each provider's API
   - Rate limiting and throttling mechanisms
   - Error handling and retry mechanisms
   - Caching strategy for responses

2. **Settings Security Strategy**:
   - How to handle potentially sensitive API keys (encryption)
   - Whether to move settings to a server-side solution
   - Authorization levels for different settings
   - Secure storage options for API keys

3. **Application Enhancement**:
   - Prioritization of feature enhancements across applications
   - Integration points between applications
   - Data sharing between applications

## Next Steps

### Immediate Priorities
1. Connect LLM conversation component to settings values
2. Add validation for settings inputs
3. Implement settings import/export functionality
4. Add error handling and loading states for API calls

### Medium-Term Goals
1. Enhance arXiv Browser and Zotero Clone functionality
2. Improve authentication system with additional providers
3. Implement dark/light mode theming
4. Create proper error boundaries and fallbacks

## Related Components

### Authentication System
- NextAuth integration provides:
  - Multiple authentication providers
  - Session management
  - Protected routes
  - User profile information

### Settings Dialog
- The settings dialog component provides:
  - Tabbed interface for different app settings
  - Form controls for various setting types
  - Save and cancel functionality
  - Reset options for settings

## Cross-References

- All application components interact with the dashboard container
- Settings dialog interacts with all components via context
- Authentication system provides user context to all protected components
- Dashboard serves as the container and navigation system for all components

## Technical Debt

1. Mock data instead of real API integration
2. Lack of comprehensive error handling across all API calls
3. Limited test coverage
4. Client-side storage of potentially sensitive settings
5. Hard-coded values that should be configurable
6. UI inconsistencies between global settings and per-conversation settings
7. Need for better accessibility in custom components
8. Testing coverage for API validation functions