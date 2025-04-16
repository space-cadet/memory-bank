# Memory Management Rules

*Last Updated: April 16, 2025*

## Purpose
This module defines rules for managing Memory Bank files and optimizing memory usage within the Integrated Code Rules system.

## File Management
- Organize Memory Bank files into tiers: core, context-store, modules, templates, examples.
- Load only necessary files for the current task to optimize token usage.
- Use session_cache.md to track loaded modules and task progress.
- Update edit_history.md after every file modification.
- Log errors and resolutions in errorLog.md.

## Memory Optimization
- Unload unused modules to free token space.
- Use progressive disclosure to load detailed instructions only when needed.
- Maintain backward compatibility during transitions.

## Task Association
- Associate tasks with recommended modules for efficient context loading.
- Use manifest.json to track module dependencies and versions.

## Versioning
- Follow semantic versioning for all Memory Bank files.
- Maintain changelogs for tracking changes.