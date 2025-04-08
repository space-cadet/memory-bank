# Roo Code Rules

## Overview
This document outlines the coding conventions, patterns, and best practices to be followed when developing in this project. It includes essential information about tool usage, formatting requirements, and integration capabilities.

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

## Tool Usage and Formatting

### XML Tag Format
Tool use is formatted using XML-style tags. The tool name is enclosed in opening and closing tags, and each parameter is similarly enclosed within its own set of tags:

```
<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>
```

### File Reading
To read file contents:

```
<read_file>
<path>src/main.js</path>
</read_file>
```

With line specifications:

```
<read_file>
<path>src/app.ts</path>
<start_line>46</start_line>
<end_line>68</end_line>
</read_file>
```

### File Searching
For regex searches across files:

```
<search_files>
<path>.</path>
<regex>your-pattern-here</regex>
<file_pattern>*.ts</file_pattern>
</search_files>
```

### Directory Listing
To list files and directories:

```
<list_files>
<path>.</path>
<recursive>false</recursive>
</list_files>
```

### Code Definition Analysis
For analyzing code structure:

```
<list_code_definition_names>
<path>src/</path>
</list_code_definition_names>
```

### File Modification (Diff Format)
For precise, surgical modifications to existing files using search and replace blocks:

```
<apply_diff>
<path>File path here</path>
<diff>
<<<<<<< SEARCH
:start_line:1
:end_line:5
-------
def calculate_total(items):
    total = 0
    for item in items:
        total += item
    return total
=======
def calculate_total(items):
    """Calculate total with 10% markup"""
    return sum(item * 1.1 for item in items)
>>>>>>> REPLACE
</diff>
</apply_diff>
```

Multiple edits in one diff:

```
<apply_diff>
<path>File path here</path>
<diff>
<<<<<<< SEARCH
:start_line:1
:end_line:2
-------
def calculate_sum(items):
    sum = 0
=======
def calculate_sum(items):
    sum = 0
>>>>>>> REPLACE

<<<<<<< SEARCH
:start_line:4
:end_line:5
-------
        total += item
    return total
=======
        sum += item
    return sum 
>>>>>>> REPLACE
</diff>
</apply_diff>
```

### File Creation/Overwriting
To write complete content to a file:

```
<write_to_file>
<path>frontend-config.json</path>
<content>
{
  "apiEndpoint": "https://api.example.com",
  "theme": {
    "primaryColor": "#007bff",
    "secondaryColor": "#6c757d",
    "fontFamily": "Arial, sans-serif"
  },
  "features": {
    "darkMode": true,
    "notifications": true,
    "analytics": false
  },
  "version": "1.0.0"
}
</content>
<line_count>14</line_count>
</write_to_file>
```

### Command Execution
To execute commands in the system:

```
<execute_command>
<command>npm run dev</command>
</execute_command>
```

With custom working directory:

```
<execute_command>
<command>ls -la</command>
<cwd>/home/user/projects</cwd>
</execute_command>
```

### Task Completion
After completing a task:

```
<attempt_completion>
<r>
Your final result description here
</r>
<command>open index.html</command>
</attempt_completion>
```

### Follow-up Questions
To ask for additional information:

```
<ask_followup_question>
<question>What is the path to the frontend-config.json file?</question>
<follow_up>
<suggest>./src/frontend-config.json</suggest>
<suggest>./config/frontend-config.json</suggest>
<suggest>./frontend-config.json</suggest>
</follow_up>
</ask_followup_question>
```

## MCP (Model Context Protocol) Servers

MCP enables communication between the system and servers that provide additional tools and resources. Available servers include:

### 1. arxiv-mcp-server
Tools for searching and downloading academic papers from arXiv.

#### Example: Searching Papers
```
<use_mcp_tool>
<server_name>arxiv-mcp-server</server_name>
<tool_name>search_papers</tool_name>
<arguments>
{
  "query": "quantum gravity",
  "max_results": 5
}
</arguments>
</use_mcp_tool>
```

### 2. deepwebresearch
Tools for advanced web research and content extraction.

#### Example: Deep Research
```
<use_mcp_tool>
<server_name>deepwebresearch</server_name>
<tool_name>deep_research</tool_name>
<arguments>
{
  "topic": "latest advances in quantum computing",
  "maxDepth": 2,
  "maxBranching": 3
}
</arguments>
</use_mcp_tool>
```

### 3. playwright
Tools for browser automation and web interaction.

#### Example: Page Navigation
```
<use_mcp_tool>
<server_name>playwright</server_name>
<tool_name>playwright_navigate</tool_name>
<arguments>
{
  "url": "https://example.com",
  "browserType": "chromium"
}
</arguments>
</use_mcp_tool>
```

### 4. youtube
Tools for YouTube video analysis and content retrieval.

#### Example: Video Details
```
<use_mcp_tool>
<server_name>youtube</server_name>
<tool_name>getVideoDetails</tool_name>
<arguments>
{
  "videoIds": ["dQw4w9WgXcQ"]
}
</arguments>
</use_mcp_tool>
```

### 5. github
Tools for GitHub repository management and interaction.

#### Example: Repository Content
```
<use_mcp_tool>
<server_name>github</server_name>
<tool_name>get_file_contents</tool_name>
<arguments>
{
  "owner": "username",
  "repo": "repository",
  "path": "file.js"
}
</arguments>
</use_mcp_tool>
```

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

## Implementation Process

### Step-by-Step Approach
1. Analyze requirements thoroughly
2. Plan implementation approach
3. Execute changes systematically
4. Test comprehensively
5. Document thoroughly
6. Review for quality assurance

### Tool Use Guidelines
1. Assess what information you already have and what you need
2. Choose the most appropriate tool for the current task
3. Use one tool at a time and wait for results before proceeding
4. Format tool usage using the specified XML format
5. Wait for confirmation after each tool use before proceeding

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

This document serves as a comprehensive reference for maintaining code quality and consistency throughout the project lifecycle. Adherence to these guidelines ensures a maintainable, robust codebase that can evolve to meet changing requirements while properly leveraging the available tools and integration capabilities.
