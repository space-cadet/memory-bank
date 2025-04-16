# Core Rules

*Last Updated: April 16, 2025*

## Purpose and Philosophy
This core module provides the essential instructions required for the operation of the Integrated Code Rules and Memory Bank System. It is designed to be minimal in size to reduce token usage while maintaining critical guidance for safe and consistent task execution.

## Safety Guidelines
- Operate exclusively within designated project directories.
- Avoid executing commands that may affect system state without explicit approval.
- Always verify file paths before reading or writing.
- Maintain strict control over module loading and unloading to prevent context corruption.

## Minimal Command Reference
- `load_module [module_name]`: Load a specific rule module dynamically.
- `unload_module [module_name]`: Unload a specific rule module to free token space.
- `list_modules`: List all available modules and their current load status.
- `suggest_modules [task_id]`: Suggest relevant modules based on the current task context.

## Basic Document Structure
- Use modular files for rules and guidelines.
- Maintain clear separation between core, modules, context-store, and examples.
- Update session_cache.md to track loaded modules and task progress.

## Module Loading Instructions
To load a module, use the following command format:

```
<load_module>
<module_name>module-name</module_name>
</load_module>
```

To unload a module:

```
<unload_module>
<module_name>module-name</module_name>
</unload_module>
```

Always keep core-rules.md loaded; it should not be unloaded.
