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

# Memory Bank System

This prompt establishes the Memory Bank system, which maintains perfect project knowledge across AI assistant chat sessions. It's designed for efficient context management with progressive loading and session continuity.

## 1. Core Principles & Memory Organization

### 1.1 Memory Bank Purpose

The Memory Bank is a structured documentation system that:
- Maintains complete project knowledge across multiple chat sessions
- Uses progressive loading to optimize token usage
- Provides explicit commands for memory management
- Creates time-stamped session logs for project history
- Implements session caching for continuity

### 1.2 Knowledge Management Tiers

Memory is organized in four tiers with different loading priorities:

1. **Bootstrap Tier (Always Load First)**
   - `bootstrap.md` - Core command definitions and system structure
   - Must be processed before any other operations

2. **Critical Tier (Default Load)**
   - `activeContext.md` - Current state, focus, and cross-references
   - `progress.md` - Status tracking and next priorities
   - `session_cache.md` - Continuity information (if exists)

3. **Essential Tier (Load on Demand)**
   - `projectbrief.md` - Core requirements and project scope
   - `.cursorrules` - Project patterns and implementation guidelines

4. **Reference Tier (Consult as Required)**
   - `productContext.md` - Why and how the project works
   - `systemPatterns.md` - Architecture and design patterns
   - `techContext.md` - Technical implementation details
   - Additional specialized documentation

## 2. Memory Bank Command System

### 2.1 Reading Commands

| Command | Description |
|---------|-------------|
| `read_mb` | Load Critical tier files only |
| `read_mb standard` | Load Critical + Essential tiers |
| `read_mb complete` | Load all Memory Bank files |
| `read_mb [file1] [file2]` | Load specific files only |

### 2.2 Update Commands

| Command | Description |
|---------|-------------|
| `update_mb` | Update only files with meaningful changes |
| `update_mb complete` | Update all Memory Bank files |
| `update_mb [file1] [file2]` | Update specific files only |

### 2.3 Session Commands

| Command | Description |
|---------|-------------|
| `continue_session` | Flag this as a continuation; prioritize session_cache.md |
| `complete_session` | Mark session as complete, update Memory Bank |
| `cache_session` | Create continuation point with minimal updates |
| `start_session` | Begin a new session with fresh time-stamp |

## 3. Session Management System

### 3.1 Time-stamped Session Logs

For each chat session:
- Create a new time-stamped file in the `/sessions/` directory
- Use ISO format: `YYYY-MM-DDTHHMMSS.md`
- Record all significant progress during the session
- Document decisions made with rationale
- Update at conclusion with accomplishments and pending tasks

### 3.2 Session Cache Mechanism

The `session_cache.md` file:
- Maintains state between sessions
- Contains pointer to most recent session log
- Includes status flag (COMPLETE or CONTINUING)
- Lists files consulted in current session
- Summarizes in-progress work
- Provides context needed for continuation

### 3.3 Default Session Workflow

1. Start by checking for `session_cache.md`
2. If continuing, load the most recent session log
3. Create new time-stamped session log
4. Update session log throughout conversation
5. Before ending, update session log with status
6. If continuing, update session_cache.md
7. If complete, update all relevant Memory Bank files

## 4. Progressive Loading System

### 4.1 Default Loading Process

1. Always load `bootstrap.md` first
2. Check for `session_cache.md` to determine continuity
3. Load Critical tier files by default
4. Assess knowledge needs for current task
5. Load additional files only when necessary
6. Use explicit commands for deeper context

### 4.2 Implementation Flow

```
flowchart TD
    Start[Start Session] --> ReadBootstrap[Read Bootstrap File]
    ReadBootstrap --> CheckCache{Check session_cache.md}
    
    CheckCache -->|Exists| LoadCache[Load Session Cache]
    LoadCache --> LoadRecentSession[Load Most Recent Session Log]
    LoadRecentSession --> LoadCritical[Load Critical Tier]
    
    CheckCache -->|Doesn't Exist| CreateSession[Create New Session Log]
    CreateSession --> LoadCritical
    
    LoadCritical --> AssessNeeds{Need More Context?}
    AssessNeeds -->|Yes| LoadRequest[Load Requested Files]
    AssessNeeds -->|No| BeginWork[Begin Work]
    
    LoadRequest --> BeginWork
    
    BeginWork --> UpdateProgress[Update Progress Regularly]
    UpdateProgress --> SessionEnd{Session Ending?}
    
    SessionEnd -->|Yes, Complete| UpdateFull[Update Full Memory Bank]
    SessionEnd -->|Yes, Continuing| UpdateCache[Update Session Cache]
    SessionEnd -->|No| UpdateProgress
    
    UpdateFull --> End[End Session]
    UpdateCache --> End
```

## 5. Core File Structure & Format

### 5.1 bootstrap.md

Core command definitions and structure that the LLM must recognize immediately.

```markdown
# Memory Bank Bootstrap System

*Last Updated: [Date]*

## Bootstrap Purpose
[Purpose statement]

## Command Definitions
[Command tables]

## Knowledge Management Tiers
[Tier definitions]

## Session System
[Session system description]

## Core Implementation Behavior
[Implementation details]
```

### 5.2 activeContext.md

Current state, focus, and cross-references.

```markdown
# Active Context

*Last Updated: [Date]*

## Current Focus
[Current focus description]

## System State
[Current system state]

## Active Decisions
[List of active decisions]

## Cross-References
[Related file references]

## Current Considerations
[Current considerations]

## Next Actions
[List of next actions]
```

### 5.3 progress.md

Status tracking and next priorities.

```markdown
# Project Progress

*Last Updated: [Date]*

## What Works
[List of completed items with ✅]

## In Progress
[List of in-progress items with 🔄]

## To Do
[List of pending items with ⬜]

## Known Issues
[List of known issues]

## Next Priorities
[List of next priorities]

## Project Status
[Current project status]
```

### 5.4 session_cache.md

Continuity information for multi-session tasks.

```markdown
# Session Cache

*Created: [Date]*

## Status
[CONTINUING or COMPLETE]

## Current Task
[Brief description of in-progress work]

## Most Recent Session
[Filename of most recent session log]

## Files Consulted
[List of files used in current session]

## Work Summary
[Key accomplishments and current progress]

## Continuity Context
[Any specific context needed for continuation]
```

### 5.5 Time-stamped Session Logs

History of all chat sessions.

```markdown
# Session Log: [ISO Date-Time]

## Session Goals
[What this session aims to accomplish]

## Progress Log
[Chronological record of significant progress]

## Decisions Made
[Key decisions and their rationale]

## End of Session Status
[Complete or continuing]

## Accomplishments
[What was completed in this session]

## Pending Tasks
[What remains to be done]
```

## 6. Implementation Guidelines

### 6.1 Safety & Scope

1. Operate exclusively within the designated project directory and subdirectories
2. Do not access, read, or modify files outside defined scope
3. Avoid executing shell commands that might affect system state
4. Always verify paths before file operations

### 6.2 Step-by-Step Approval

1. Propose clear, step-by-step plans for any task involving file modifications
2. Wait for explicit user approval before implementing plans
3. Focus on necessary files/components related to the task
4. Avoid unnecessary project-wide scans

### 6.3 Update Process

1. Only update files with meaningful changes
2. Always update timestamps when modifying files
3. Ensure cross-references remain valid after updates
4. Use session_cache.md for continuity rather than full updates
5. Prioritize updating activeContext.md and progress.md for general status

### 6.4 Style Conventions

1. Use consistent formatting across all Memory Bank files
2. Include creation and last updated timestamps
3. Use clear section headings with ## heading level
4. Use status indicators: ✅ (Complete), 🔄 (In Progress), ⬜ (Not Started)
5. Include cross-references where appropriate

## 7. Core Implementation Behavior

When starting a session with a Memory Bank:

1. Always read `bootstrap.md` first to understand command system
2. Check for `session_cache.md` to determine if continuing a session
3. If continuing, load the most recent session log
4. Create a new time-stamped session log in the `/sessions/` directory
5. Load critical tier files by default
6. Process any explicit memory bank commands
7. Update session log throughout the conversation
8. Before ending, either update session_cache.md (if continuing) or update all Memory Bank files (if complete)

Remember: The Memory Bank's effectiveness comes from:
- Loading only what's needed (minimize token usage)
- Using session_cache.md for continuity across sessions
- Updating differentially based on actual changes
- Following explicit memory bank commands when provided

The goal is efficient resource use while maintaining complete project knowledge across multiple chat sessions.
