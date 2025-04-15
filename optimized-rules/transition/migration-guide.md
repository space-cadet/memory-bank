# Migration Guide: From Monolithic to Modular Rules

*Last Updated: April 15, 2025*

## Purpose

This guide outlines the process for transitioning from the current monolithic Integrated Rules system to the new modular Optimized Rules system. The goal is to significantly reduce token usage while maintaining full functionality.

## Migration Approach

The migration will follow a phased approach to ensure continuity and minimize disruption:

### Phase 1: Parallel Development (Current)
- Create optimized-rules directory structure
- Develop core modules and manifest system
- Set up module loading mechanism
- Create mapping between old and new systems

### Phase 2: Testing and Validation
- Use the new system on simulated tasks
- Measure token usage compared to the original system
- Validate functionality across different task types
- Refine modules based on testing feedback

### Phase 3: Graduated Transition
- Begin using core-rules.md for new sessions
- Load specific modules as needed for tasks
- Continue using existing memory bank files
- Update session_cache.md to track loaded modules

### Phase 4: Complete Migration
- Fully transition to the modular system
- Update all references to use new file paths
- Optionally rename memory-bank to context-store
- Archive original integrated rules files

## Command Mapping

| Original Command | New Command | Notes |
|------------------|-------------|-------|
| `read_mb` | `read_mb` | Unchanged, now aware of modules |
| `update_mb` | `update_mb` | Unchanged |
| `create_task` | `create_task` | Now associates task with recommended modules |
| `switch_task` | `switch_task` | Now handles module loading/unloading |
| | `load_module` | New command for module loading |
| | `unload_module` | New command for module unloading |
| | `list_modules` | New command to list available modules |
| | `suggest_modules` | New command to get module recommendations |

## File Path Transitioning

Current paths will continue to work during the transition period. The system will automatically translate between:

- `/Users/deepak/code/memory-bank/integrated-rules-v4.md` → `/Users/deepak/code/memory-bank/optimized-rules/core/core-rules.md` + modules
- `/Users/deepak/code/memory-bank/memory-bank/` → `/Users/deepak/code/memory-bank/optimized-rules/context-store/` (optional rename)

## Session Cache Updates

The session_cache.md file will be enhanced to track loaded modules:

```markdown
## Loaded Modules
- core-rules.md (v1.0.0) - Always loaded
- documentation-rules.md (v1.0.0) - Loaded at 2025-04-15 22:30 UTC
- implementation-rules.md (v1.0.0) - Loaded at 2025-04-15 22:35 UTC
```

## Task Registry Updates

The tasks.md file will be enhanced to associate tasks with recommended modules:

```markdown
### T4: Optimize Integrated Rules for Token Efficiency
**Description**: Implement a tiered, modular, and dynamically loaded Integrated Rules system
**Status**: 🔄 IN PROGRESS
**Recommended Modules**: implementation-rules, memory-management-rules, tool-usage-rules
```

## Testing Method

To validate the migration:

1. Measure token usage with the original system
2. Measure token usage with core-rules only
3. Measure token usage with core-rules + task-specific modules
4. Compare functionality and execution quality
5. Document findings and adjust modules as needed

## Fallback Mechanism

During the transition period, a compatibility layer will be provided:

- If a module loading fails, the system will fall back to the original integrated rules
- Error messages will guide users to the correct module loading commands
- The system will track which features require which modules

## Next Steps

1. Complete development of the first set of modules
2. Create test scenarios for validation
3. Begin using the core-rules.md in new sessions
4. Gradually incorporate module loading into workflows
5. Measure and document token usage improvements

## Reference

Refer to the module-mapping.json file for a detailed mapping between the original sections and the new modular organization.
