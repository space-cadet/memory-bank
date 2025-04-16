# Quickstart Guide

*Last Updated: April 16, 2025*

## Introduction
This quickstart guide helps you begin using the modular Integrated Code Rules and Memory Bank System efficiently.

## Starting a Session
1. Always start with the core-rules.md module loaded.
2. Use the module loading commands to add functionality as needed:
   ```
   <load_module>
   <module_name>module-name</module_name>
   </load_module>
   ```
3. Track loaded modules in session_cache.md to maintain context.

## Basic Workflow
- Identify the task type.
- Load recommended modules for the task type.
- Perform task operations using loaded modules.
- Unload modules when switching to different task types to optimize token usage.

## Module Recommendations by Task Type
- Documentation: documentation-rules, memory-management-rules
- Implementation: implementation-rules, tool-usage-rules, error-handling-rules
- Maintenance: session-management-rules, memory-management-rules
- Optimization: implementation-rules, memory-management-rules, tool-usage-rules

## Additional Resources
- Refer to command-reference.md for command syntax.
- See loader.md for detailed module loading instructions.
- Consult docs/guides/ for user guides and best practices.
