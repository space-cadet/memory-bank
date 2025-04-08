# Integrated Code Rules and Memory Bank System

*Last Updated: April 8, 2025*

## 1. Unified System Purpose and Philosophy

### 1.1 Core Purpose

The Integrated Code Rules and Memory Bank System is designed to:
- Balance task execution efficiency with comprehensive project knowledge
- Maintain consistent coding standards and documentation practices
- Ensure project continuity across multiple sessions
- Optimize resource usage by loading only necessary information
- Standardize tool usage and communication formats

### 1.2 Balanced Approach

This system implements a balance between:
- **Task-First Efficiency**: Prioritizing immediate task execution with minimal context
- **Consistent Documentation**: Maintaining sufficient project knowledge for continuity
- **Standardized Implementation**: Following consistent coding patterns and practices
- **Progressive Knowledge**: Building and maintaining project history when valuable

## 2. Integrated Command System

### 2.1 Task Execution Commands

| Command | Description |
|---------|-------------|
| `do_task [task]` | Execute specific task with minimal context loading |
| `continue_task` | Resume previous task using minimal context from cache |
| `complete_task` | Finish current task with targeted documentation updates |
| `verify_task` | Check implementation against code standards |

### 2.2 Memory Management Commands

| Command | Description |
|---------|-------------|
| `read_mb` | Load Critical tier files needed for current task |
| `read_mb [file]` | Load specific file only |
| `read_mb standard` | Load Critical + Essential tiers |
| `read_mb complete` | Load all Memory Bank files (rarely needed) |
| `update_mb [file]` | Update specific file with minimal changes |

### 2.3 Session Management Commands

| Command | Description |
|---------|-------------|
| `continue_session` | Flag this as a continuation; prioritize session_cache.md |
| `complete_session` | Mark session as complete, update necessary docs |
| `cache_session` | Create continuation point with minimal updates |
| `start_session` | Begin new session with fresh timestamp |

### 2.4 Code Implementation Commands

| Command | Description |
|---------|-------------|
| `verify_code` | Check code against project standards |
| `format_code` | Ensure code follows formatting guidelines |
| `document_code` | Update documentation for code changes |

## 3. Knowledge Organization and Management

### 3.1 Tiered Knowledge Structure

Knowledge is organized in four tiers with task-oriented loading priorities:

1. **Bootstrap Tier (Minimal Required Knowledge)**
   - `bootstrap.md` - Core system structure, loaded only when essential
   - Access only when needed to understand command system

2. **Critical Tier (Task-Relevant Only)**
   - `activeContext.md` - Current state relevant to immediate task
   - `progress.md` - Status information needed for current step
   - `session_cache.md` - Minimal continuity information if continuing a task
   - Load only files directly relevant to current task step

3. **Essential Tier (Load Only When Required)**
   - `projectbrief.md` - Reference only when task scope is unclear
   - `.cursorrules` - Reference only when implementation patterns are needed
   - Load only when task requirements aren't clear from Critical tier

4. **Reference Tier (Avoid Unless Specifically Needed)**
   - `productContext.md` - Why and how the project works
   - `systemPatterns.md` - Architecture and design patterns
   - `techContext.md` - Technical implementation details
   - Load only specific files when directly relevant to current task step

### 3.2 Task-First Loading Process

1. Analyze the immediate task requirements
2. Identify the minimal set of files needed for the current step
3. Load only those files directly relevant to the current task
4. Execute the current step completely
5. Load additional files only when needed for the next step
6. Update only files with meaningful changes related to the task

### 3.3 Documentation Decision Framework

| Change Type | Documentation Requirements |
|-------------|----------------------------|
| Interface changes | Update API docs, activeContext.md |
| Implementation details | Code comments only |
| Architecture changes | Update systemPatterns.md |
| New features | Update progress.md, projectbrief.md |
| Bug fixes | Update progress.md only |
| Refactoring | Minimal documentation unless patterns change |

## 4. Technical Implementation Standards

### 4.1 XML Tag Format

Tool use is formatted using XML-style tags:

```
<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>
```

### 4.2 File Operations

#### Reading Files

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

#### Searching Files

```
<search_files>
<path>.</path>
<regex>your-pattern-here</regex>
<file_pattern>*.ts</file_pattern>
</search_files>
```

#### Directory Listing

```
<list_files>
<path>.</path>
<recursive>false</recursive>
</list_files>
```

#### File Modification (Diff Format)

For precise, surgical modifications:

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

#### File Creation/Overwriting

```
<write_to_file>
<path>config.json</path>
<content>
{
  "apiEndpoint": "https://api.example.com",
  "version": "1.0.0"
}
</content>
</write_to_file>
```

### 4.3 Code Standards

- Use modular design with clear separation of concerns
- Make surgical, precise changes when editing existing files
- Maintain consistent indentation and formatting
- Document interfaces and APIs with clear specifications
- Follow asynchronous patterns for I/O operations
- Implement proper error handling and validation

### 4.4 Documentation Standards

- Update only files with meaningful changes
- Include creation and last updated timestamps
- Use clear section headings with ## heading level
- Use status indicators: ✅ (Complete), 🔄 (In Progress), ⬜ (Not Started)
- Make targeted updates rather than comprehensive rewrites

## 5. Integrated Workflows

### 5.1 Task-First Implementation Flow

```
flowchart TD
    Start[Receive Task] --> Analyze[Analyze Immediate Task Needs]
    Analyze --> LoadMinimal[Load Minimal Required Context]
    LoadMinimal --> Execute[Execute First Step]
    Execute --> Evaluate{More Steps?}
    Evaluate -->|Yes| NextContext[Load Context for Next Step]
    NextContext --> NextStep[Execute Next Step]
    NextStep --> Evaluate
    Evaluate -->|No| Verify[Verify Against Standards]
    Verify --> Document[Update Required Documentation]
    Document --> End[End]
```

### 5.2 Session Management Flow

```
flowchart TD
    Start[Start Session] --> CheckCache{Check session_cache.md}
    CheckCache -->|Exists| LoadCache[Load Session Cache]
    LoadCache --> LoadTask[Load Task-Relevant Files]
    
    CheckCache -->|Doesn't Exist| CreateSession[Create New Session Log]
    CreateSession --> LoadTask
    
    LoadTask --> ExecuteTask[Execute Task Steps]
    ExecuteTask --> SessionEnd{Session Ending?}
    
    SessionEnd -->|Yes, Complete| UpdateDocs[Update Documentation]
    SessionEnd -->|Yes, Continuing| UpdateCache[Update Session Cache]
    SessionEnd -->|No| ExecuteTask
    
    UpdateDocs --> End[End Session]
    UpdateCache --> End
```

### 5.3 Documentation Update Process

1. After completing a task, determine documentation requirements based on change type
2. Update only the necessary files based on the Documentation Decision Framework
3. Always update timestamps and status indicators
4. For continuing tasks, update session_cache.md with minimal state information
5. For completed tasks, update relevant Memory Bank files based on impact

## 6. Core File Structure and Templates

### 6.1 session_cache.md (Task-Oriented Version)

```markdown
# Session Cache

*Last Updated: [Date]*

## Status
[CONTINUING or COMPLETE]

## Current Task
[Specific task in progress]

## Current Step
[Exact step in the process]

## Critical Files
[Only files needed to continue the task]

## State Information
[Minimal state needed to continue]
```

### 6.2 activeContext.md (Task-Oriented Version)

```markdown
# Active Context

*Last Updated: [Date]*

## Current Tasks
[List of active tasks with current status]

## Implementation Focus
[Specific components currently being modified]

## Current Decisions
[Only decisions directly affecting current tasks]

## Next Actions
[Specific next steps for current tasks]
```

### 6.3 Time-stamped Session Logs

```markdown
# Session Log: [ISO Date-Time]

## Task Focus
[Specific tasks addressed in this session]

## Implementation Steps
[Steps taken during implementation]

## Decisions Made
[Key decisions with rationale]

## Status
[COMPLETE or CONTINUING]

## Next Steps
[Only if continuing]
```

## 7. External Tools and Integration

### 7.1 MCP (Model Context Protocol) Servers

Available MCP servers include:

- **arxiv-mcp-server**: Academic paper research
- **deepwebresearch**: Web research and content extraction
- **playwright**: Browser automation and web interaction
- **youtube**: Video analysis and content retrieval
- **github**: Repository management and interaction

#### Example: MCP Tool Usage

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

### 7.2 API Integration

- Use structured JSON for data exchange
- Implement proper error handling for API responses
- Follow RESTful principles for endpoint design
- Document all API contracts as part of the implementation

### 7.3 External Libraries

- Prefer established libraries over custom implementations
- Document dependencies in the appropriate Memory Bank files
- Maintain compatibility with existing project dependencies
- Verify license compatibility before introducing new dependencies

## 8. Communication Style

### 8.1 Task-Oriented Communication

1. Use direct, clear statements focused on actions and results
2. Avoid unnecessary explanations of process or methodology
3. Be concise and avoid conversational language
4. Focus on what was done and what will be done next
5. For task discussions, use action-oriented language

### 8.2 Implementation Process

When starting work:
1. Focus immediately on understanding the specific task
2. Load only the minimum files needed for the current step
3. Execute the step completely before getting additional context
4. Document changes in a targeted, minimal way
5. Complete tasks efficiently with minimal information gathering

## 9. Implementation Guidelines

### 9.1 Safety & Scope

1. Operate exclusively within the designated project directory and subdirectories
2. Do not access, read, or modify files outside defined scope
3. Avoid executing shell commands that might affect system state
4. Always verify paths before file operations

### 9.2 Step-by-Step Approval

1. Propose clear, step-by-step plans for any task involving file modifications
2. Wait for explicit user approval before implementing plans
3. Focus on necessary files/components related to the task
4. Avoid unnecessary project-wide scans

### 9.3 Efficiency Rules

1. Do not read file content you already have
2. Avoid reading entire repos or directories
3. Focus only on the specific files needed for the current step
4. When examining code, look for the specific components relevant to the task
5. Trust that you can access more information if needed rather than loading it preemptively

## 10. Integration with Development Workflow

This integrated system is designed to:
- Support rapid task execution while maintaining documentation quality
- Ensure code standards are maintained without excessive overhead
- Provide just enough context for effective implementation
- Document only what's necessary for project continuity
- Balance immediate task needs with long-term project knowledge

Remember: The system's effectiveness comes from balancing task efficiency with appropriate documentation, loading only what's needed when it's needed, and following a consistent, standardized approach to both code and documentation.