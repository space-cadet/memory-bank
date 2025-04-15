# Dynamic Module Loader

*Last Updated: April 15, 2025*

## Purpose
This document provides instructions for dynamically loading and unloading rule modules during sessions. The modular approach allows for significant token efficiency by loading only the modules relevant to the current task.

## Core Module
The core-rules.md module is always loaded at the beginning of each session. It contains essential instructions for system operation but is minimized to reduce token usage.

## Module Loading Commands

### Load a Module
```
<load_module>
<module_name>documentation-rules</module_name>
</load_module>
```

### Unload a Module
```
<unload_module>
<module_name>error-handling-rules</module_name>
</unload_module>
```

### List Available Modules
```
<list_modules>
</list_modules>
```

### Get Module Suggestions for Current Task
```
<suggest_modules>
<task_id>T4</task_id>
</suggest_modules>
```

## Module Dependency Handling

When loading a module, all its dependencies will automatically be loaded as well. Dependencies are defined in the manifest.json file.

Example:
- When loading `task-management-rules`, both `memory-management-rules` and `session-management-rules` will also be loaded if not already present.

## Session Cache Updates

When modules are loaded or unloaded, the session_cache.md file is automatically updated to track the currently loaded modules:

```markdown
## Loaded Modules
- core-rules.md (v1.0.0) - Always loaded
- documentation-rules.md (v1.0.0) - Loaded at 2025-04-15 22:30 UTC
- implementation-rules.md (v1.0.0) - Loaded at 2025-04-15 22:35 UTC
```

## Task-Based Module Recommendations

Different tasks benefit from different rule modules. The system can suggest appropriate modules based on task type:

- **Documentation Tasks**: documentation-rules, memory-management-rules
- **Implementation Tasks**: implementation-rules, tool-usage-rules, error-handling-rules
- **Maintenance Tasks**: session-management-rules, memory-management-rules
- **Optimization Tasks**: implementation-rules, memory-management-rules, tool-usage-rules

## Error Handling

If a module cannot be loaded (not found, version mismatch, etc.), the system will:
1. Log an error to errorLog.md
2. Provide fallback instructions from core-rules.md
3. Suggest alternative modules if available

## Performance Considerations

To optimize token usage:
1. Load only modules directly relevant to the current task
2. Unload modules when switching to a different task type
3. Consider task relationships when deciding which modules to keep loaded
4. Core rules are optimized for minimal token usage and should not be unloaded
