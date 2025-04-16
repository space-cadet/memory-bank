# Session Management Rules

*Last Updated: April 16, 2025*

## Purpose
This module provides guidelines for tracking and managing sessions within the Integrated Code Rules and Memory Bank System.

## Session Tracking
- Maintain session_cache.md to track active tasks, loaded modules, and progress.
- Update session_cache.md after each significant task step or module load/unload.
- Use timestamps and versioning to ensure session consistency.

## Task Management
- Support multi-task tracking and switching.
- Record task dependencies and statuses.
- Provide mechanisms for task prioritization and scheduling.

## Module Management
- Load and unload modules dynamically based on task context.
- Track module dependencies and versions in manifest.json.
- Ensure core-rules.md is always loaded and never unloaded.

## Error Handling
- Log session-related errors in errorLog.md.
- Provide fallback instructions from core-rules.md if modules fail to load.