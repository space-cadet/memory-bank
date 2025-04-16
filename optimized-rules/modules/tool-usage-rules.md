# Tool Usage Rules

*Last Updated: April 16, 2025*

## Purpose
This module provides detailed guidelines for the proper use of tools within the Integrated Code Rules and Memory Bank System.

## Tool Invocation
- Use structured JSON input and output for all tool interactions.
- Follow command syntax precisely to ensure correct execution.
- Validate all parameters before tool invocation.
- Handle tool errors gracefully and log them in errorLog.md.

## Tool Categories
- File operations (read, write, edit)
- Search and navigation
- Task management
- Module management
- External API interactions

## Best Practices
- Minimize tool usage to reduce token consumption.
- Cache results when possible to avoid redundant calls.
- Use progressive disclosure to load tool usage details only when necessary.
- Document tool usage patterns in tool-usage-rules.md.

## Error Handling
- Log tool errors with detailed context.
- Provide fallback instructions in core-rules.md.
- Notify users of critical tool failures affecting task progress.