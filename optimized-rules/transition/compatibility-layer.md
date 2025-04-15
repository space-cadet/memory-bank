# Compatibility Layer for Optimized Rules

*Last Updated: April 15, 2025*

## Purpose

This document provides instructions for maintaining backward compatibility during the transition from the monolithic Integrated Rules system to the new modular Optimized Rules system.

## Command Compatibility

### Original Commands

All original commands will continue to function during and after the transition:

- `read_mb`, `update_mb`, `log_error`, etc. are preserved with identical syntax
- Task management commands (`create_task`, `switch_task`, etc.) work in both systems
- File operation commands work unchanged

### Command Translation

The system will automatically translate between old and new commands when needed:

| Original Context | New Context |
|------------------|-------------|
| `read_mb bootstrap.md` | Load core-rules.md |
| `read_mb standard` | Load core-rules.md + memory-management-rules.md |
| `read_mb complete` | Load all modules |

## File Path Resolution

### Path Mapping

The system will automatically resolve file paths between the old and new structure:

| Original Path | New Path |
|---------------|----------|
| `/integrated-rules-v4.md` | `/optimized-rules/core/core-rules.md` + modules |
| `/memory-bank/` | `/optimized-rules/context-store/` |
| `/templates/` | `/optimized-rules/templates/` |

### Dynamic Resolution

When a file from the original structure is requested:

1. The system checks if it exists in the original location
2. If not found, it checks the corresponding location in the new structure
3. If found in the new structure, it is loaded from there
4. If not found in either location, an error is returned

## Session Context Preservation

### Session Cache Enhancement

The session_cache.md file is enhanced to track loaded modules while maintaining compatibility with the original format:

```markdown
## Loaded Modules
- core-rules.md (v1.0.0) - Always loaded
- documentation-rules.md (v1.0.0) - Loaded at 2025-04-15 22:30 UTC
- implementation-rules.md (v1.0.0) - Loaded at 2025-04-15 22:35 UTC
```

### Context Restoration

When restoring a session that was started with the original system:

1. The core-rules.md module is loaded
2. The session_cache.md is examined to determine which features were used
3. The appropriate modules are loaded based on feature usage
4. A Loaded Modules section is added to the session_cache.md file

## Error Handling and Recovery

### Migration Errors

If errors occur during the transition:

1. The system will fall back to using the original integrated-rules-v4.md
2. An error message will be logged in errorLog.md
3. The session will continue with reduced optimization

### Feature Detection

When using a feature that requires a module that isn't loaded:

1. The system will detect the missing module
2. It will suggest loading the required module
3. It will provide the exact command to load the module

Example message:
```
This operation requires the 'documentation-rules' module, which is not currently loaded.
To load this module, use:

<load_module>
<module_name>documentation-rules</module_name>
</load_module>
```

## Testing and Verification

### Compatibility Testing

To verify compatibility:

1. Execute identical tasks in both the original and new systems
2. Compare outputs for consistency
3. Measure token usage in both systems
4. Document any discrepancies or issues

### Regression Testing

Test the following scenarios:

- Multi-task management
- Task switching
- Error handling and recovery
- Documentation updates
- File operations
- Memory bank file management

## Phased Deprecation

### Deprecation Timeline

The original system will be gradually deprecated:

1. Phase 1: Both systems available, original system preferred
2. Phase 2: Both systems available, new system preferred
3. Phase 3: New system default, original available on request
4. Phase 4: New system only, original archived

### Transition Messaging

During the transition period, messages will guide users to the new system:

```
Note: You're currently using the original Integrated Rules system.
Consider trying the new Optimized Rules system for improved token efficiency:

<load_module>
<module_name>documentation-rules</module_name>
</load_module>
```

## Reference Documentation

For detailed mapping between the systems, refer to:

- module-mapping.json - Maps original sections to new modules
- migration-guide.md - Provides step-by-step migration instructions
