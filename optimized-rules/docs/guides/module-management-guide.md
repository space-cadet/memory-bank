# Module Management Guide

*Last Updated: April 15, 2025*

## Introduction

This guide explains how to effectively use and manage rule modules in the Optimized Rules system. The modular approach allows you to load only the specific guidance needed for your current task, significantly reducing token usage.

## Basic Module Management

### Viewing Available Modules

To see all available modules and their status:

```
<list_modules>
</list_modules>
```

This shows modules, versions, descriptions, and whether they're currently loaded.

### Loading a Module

To load a specific module:

```
<load_module>
<module_name>documentation-rules</module_name>
</load_module>
```

This will load the module and all its dependencies.

### Unloading a Module

To unload a module when it's no longer needed:

```
<unload_module>
<module_name>error-handling-rules</module_name>
</unload_module>
```

Note: Modules that are dependencies of other loaded modules cannot be unloaded until those dependent modules are unloaded first.

### Getting Module Suggestions

To get module recommendations for a specific task:

```
<suggest_modules>
<task_id>T4</task_id>
</suggest_modules>
```

The system will analyze the task and suggest appropriate modules to load.

## Task-Based Module Management

### At Task Creation

When creating a new task, the system can automatically suggest relevant modules:

```
<create_task>
<title>Implement new authentication flow</title>
<suggest_modules>true</suggest_modules>
</create_task>
```

### When Switching Tasks

When switching tasks, you can automatically update loaded modules:

```
<switch_task>
<task_id>T5</task_id>
<update_modules>true</update_modules>
</switch_task>
```

This will load modules recommended for the new task and unload modules that are no longer needed.

## Module Combinations

### Common Module Bundles

Different types of work benefit from different module combinations:

#### Documentation Work
```
<load_module>
<module_name>documentation-rules</module_name>
</load_module>
```

#### Implementation Work
```
<load_module>
<module_name>implementation-rules</module_name>
</load_module>

<load_module>
<module_name>tool-usage-rules</module_name>
</load_module>
```

#### Error Handling
```
<load_module>
<module_name>error-handling-rules</module_name>
</load_module>
```

### Custom Module Loading

For specialized tasks, you can load specific combinations of modules:

```
<load_module>
<module_name>implementation-rules</module_name>
</load_module>

<load_module>
<module_name>memory-management-rules</module_name>
</load_module>
```

## Module Dependencies

### Understanding Dependencies

Modules may depend on other modules. When you load a module, its dependencies are automatically loaded as well.

Example:
- Loading `task-management-rules` will also load `memory-management-rules` and `session-management-rules` if they aren't already loaded.

### Viewing Module Dependencies

To see a module's dependencies:

```
<module_info>
<module_name>task-management-rules</module_name>
</module_info>
```

## Session Management with Modules

### Tracking Loaded Modules

The session_cache.md file automatically tracks loaded modules:

```markdown
## Loaded Modules
- core-rules.md (v1.0.0) - Always loaded
- documentation-rules.md (v1.0.0) - Loaded at 2025-04-15 22:30 UTC
- implementation-rules.md (v1.0.0) - Loaded at 2025-04-15 22:35 UTC
```

### Session Continuation

When continuing a session, previously loaded modules are automatically reloaded:

```
<continue_session>
</continue_session>
```

## Best Practices

### Token Efficiency

To minimize token usage:

1. Start with only core-rules.md loaded
2. Load task-specific modules as needed
3. Unload modules when switching to different task types
4. Use `suggest_modules` to get contextually relevant modules

### Task Management

For effective task-based module management:

1. Associate tasks with recommended modules at creation
2. Update module recommendations when task scope changes
3. Include module associations in task documentation
4. Use task-specific module bundles for common task types

### Troubleshooting

If you encounter issues with modules:

1. Check if the module exists using `list_modules`
2. Verify that all dependencies are available
3. Ensure version compatibility between modules
4. If a module fails to load, check errorLog.md for details

## Advanced Topics

### Module Versioning

Modules use semantic versioning (X.Y.Z):
- Major (X): Incompatible changes
- Minor (Y): New backwards-compatible features
- Patch (Z): Bug fixes and clarifications

When referencing modules, you can specify version constraints:

```
<load_module>
<module_name>documentation-rules</module_name>
<version>>=1.0.0 <2.0.0</version>
</load_module>
```

### Creating