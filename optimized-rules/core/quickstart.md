# Quick Start Guide

*Last Updated: April 15, 2025*

## Getting Started with the Optimized Rules System

This guide helps you quickly start using the new modular rules system for the Integrated Code Rules and Memory Bank.

## Basic Session Workflow

1. **Start Session**: Core rules are automatically loaded
2. **Load Task-Specific Modules**: Use `<load_module>` commands to load relevant modules
3. **Execute Task**: Perform work with minimal token usage
4. **Update Documentation**: Record changes to appropriate files with task references
5. **Complete or Switch Tasks**: Update task status and session cache

## Common Commands

### Task Management
```
<create_task>
<title>Optimize database queries</title>
</create_task>

<switch_task>
<task_id>T4</task_id>
</switch_task>

<complete_task>
<task_id>T3</task_id>
</complete_task>
```

### Module Management
```
<load_module>
<module_name>implementation-rules</module_name>
</load_module>

<list_modules>
</list_modules>

<suggest_modules>
<task_id>T4</task_id>
</suggest_modules>
```

### File Operations
```
<read_file>
<path>src/main.js</path>
</read_file>

<edit_block>
<blockContent>
/path/to/file
<<<<<<< SEARCH
old code
=======
new code
>>>>>>> REPLACE
</blockContent>
</edit_block>
```

## Documentation Requirements

- Always update `edit_history.md` after file changes
- Include task ID in all documentation updates
- Update task status in `tasks.md` when necessary
- Update `session_cache.md` when switching tasks

## Need More Details?

Load specific modules for detailed instructions:

```
<load_module>
<module_name>documentation-rules</module_name>
</load_module>
```

Or refer to the comprehensive module documentation in the `/optimized-rules/docs/` directory.
