# Roo Code Rules

## Overview
This document outlines the coding conventions, patterns, and best practices to be followed when developing in this project. These rules are designed to maintain code quality, consistency, and readability.

## Development Capabilities

### Tools Available
- **File Operations**: Read, write, search, and modify files within the project
- **Code Analysis**: Examine source definitions, find patterns, and understand project structure
- **Command Execution**: Run commands in the project environment
- **API Integration**: Connect with external services through defined protocols

### Project Structure
- Base directory: `/Users/deepak/code/spin_network_app`
- All file paths should be relative to this directory
- New components should be organized in dedicated directories following project conventions
- File organization should follow logical structure based on component relationships

## Code Standards

### General Guidelines
- Write clean, maintainable code with appropriate documentation
- Follow existing patterns when modifying components
- Make surgical, precise changes when editing existing files
- Provide complete implementation for new components
- Test changes thoroughly before completion

### File Modifications Best Practices
- For small changes (<20% of file): Use targeted edits that maintain surrounding context
- For major rewrites: Provide complete file content ensuring all parts are included
- Always verify changes work within the broader system context
- Maintain consistent indentation and formatting with existing code

### Programming Patterns
- Use modular design with clear separation of concerns
- Implement proper error handling and validation
- Follow asynchronous patterns for I/O operations
- Document interfaces and APIs with clear specifications
- Leverage existing utilities rather than reimplementing functionality

## Technical Specifics

### Web Development
- Use standard HTML/CSS/JavaScript for browser-compatible components
- Ensure responsive design principles are followed
- Implement proper accessibility standards
- Test across multiple browsers when applicable

### API Interactions
- Use structured JSON for data exchange
- Implement proper error handling for API responses
- Follow RESTful principles for endpoint design
- Document all API contracts thoroughly

### External Libraries
- Prefer established libraries over custom implementations
- Document dependencies clearly
- Maintain compatibility with existing project dependencies
- Verify license compatibility before introducing new dependencies

## Testing Requirements
- Create appropriate tests for new functionality
- Ensure existing tests pass after modifications
- Document test procedures for complex operations
- Follow test-driven development practices when applicable

## Documentation Standards
- Provide clear, concise documentation for all components
- Update documentation to reflect changes
- Include usage examples for APIs and libraries
- Document known limitations and edge cases

## Implementation Process
1. Analyze requirements thoroughly
2. Plan implementation approach
3. Execute changes systematically
4. Test comprehensively
5. Document thoroughly
6. Review for quality assurance

## Best Practices for Specific Technologies

### JavaScript/TypeScript
- Use modern ES features appropriately
- Implement proper type safety
- Follow functional programming principles when applicable
- Use consistent naming conventions

### Backend Development
- Implement proper authentication and authorization
- Ensure data validation at all entry points
- Follow secure coding practices
- Design for scalability and maintainability

### Frontend Frameworks
- Follow component-based architecture
- Implement proper state management
- Ensure responsive and accessible interfaces
- Optimize performance for production

## Integration Guidelines
- Ensure compatibility with existing systems
- Implement proper logging and monitoring
- Design for graceful failure handling
- Document integration requirements clearly

This document serves as a reference for maintaining code quality and consistency throughout the project lifecycle. Adherence to these guidelines ensures a maintainable, robust codebase that can evolve to meet changing requirements.
