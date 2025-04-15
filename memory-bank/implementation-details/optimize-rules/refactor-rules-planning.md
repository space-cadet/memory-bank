# Enhanced Plan for Optimizing Integrated Rules to Reduce Token Usage

## Objective
To reduce token usage caused by sending the large Integrated Rules with every request to the LLM, while maintaining sufficient context and usability for consistent task execution.

## Strategy Overview

1. **Create a Tiered Rule System**
   - **Core Rules:** Essential instructions only, approximately 20% of the current size, always loaded at session start.
   - **Extended Rules:** Additional detailed modules loaded on demand for specific tasks or contexts.

2. **Implement Dynamic Loading**
   - Start sessions with Core Rules only.
   - Load specific rule modules dynamically as needed.
   - Unload modules when no longer required to free token space.
   - Track loaded modules in session_cache.md.

3. **Restructure Documentation Flow**
   - Move templates and detailed examples to external files.
   - Replace verbose workflows with minimal instructions and references.
   - Use concise summaries and pointers to detailed documentation.

4. **Optimize Command Structure**
   - Condense command descriptions.
   - Simplify parameter documentation.
   - Use shorthand notation where possible.
   - Develop command aliases for common operations.

5. **Implement Progressive Disclosure**
   - Provide minimal instructions initially.
   - Allow mechanisms to request more detailed guidance or modules.
   - Include "help" commands to load specific guidance modules.

6. **Update Folder Structure**
   - Organize rules into modular directories (core, modules, context-store).
   - Maintain templates and examples separately.
   - Provide loader instructions for dynamic module management.

7. **Testing and Validation**
   - Measure token usage before and after optimization.
   - Validate that task execution remains consistent and reliable.
   - Iterate based on feedback and performance metrics.
   - Create regression test scenarios to ensure compatibility.

## Enhanced Requirements

Based on a review of the current memory bank files, the following additional requirements should be addressed:

1. **Module Manifest System**
   - Create a manifest.json file to track all available modules
   - Include module dependencies, version information, and loading requirements
   - Automatically suggest relevant modules based on task context
   - Implement a module registry to track which modules are currently loaded

2. **Versioning System**
   - Implement semantic versioning for all rule modules (X.Y.Z format)
   - Track compatibility between modules to prevent loading incompatible versions
   - Maintain a changelog for each module to track changes
   - Ensure backward compatibility with existing tasks

3. **Command Adaptations**
   - Create new commands for module management:
     - `load_module [module_name]` - Load a specific rule module
     - `unload_module [module_name]` - Unload a specific rule module
     - `list_modules` - List all available modules and their status
     - `suggest_modules` - Suggest relevant modules for current task
   - Update existing commands to respect modular structure

4. **Transition Plan**
   - Develop a phased transition approach:
     - Phase 1: Create core-rules.md and initial modules without changing existing files
     - Phase 2: Test with simulated task scenarios
     - Phase 3: Update session_cache.md and task management for module tracking
     - Phase 4: Full transition to modular approach
   - Maintain backward compatibility during transition

5. **Context Awareness**
   - Implement context detection to automatically suggest relevant modules
   - Create task type classification to associate task types with specific modules
   - Pre-configure module bundles for common task types
   - Add module recommendations to task creation workflow

## Expected Benefits
- Significant reduction in token usage per request (target: 60-70% reduction)
- Improved maintainability and scalability of Integrated Rules
- Enhanced flexibility to adapt rules based on task context
- Better user experience with faster and more efficient LLM interactions
- More focused guidance with only relevant rules loaded
- Easier onboarding with progressive disclosure of complexity

## Implementation Plan

### Phase 1: Analysis and Structure (Days 1-2)
1. Analyze current integrated rules for natural module boundaries
2. Define core rule set (essential instructions only)
3. Create module definitions and dependencies
4. Establish folder structure for new modular approach
5. Create manifest system for module tracking

### Phase 2: Core Implementation (Days 3-5)
1. Create core-rules.md with minimal essential instructions
2. Develop first set of rule modules:
   - documentation-rules.md
   - implementation-rules.md
   - memory-management-rules.md
   - session-management-rules.md
   - task-management-rules.md
   - error-handling-rules.md
   - tool-usage-rules.md
3. Create loader.md with dynamic module loading instructions
4. Update command system for module management

### Phase 3: Context Store and Integration (Days 6-7)
1. Refine context-store structure (renamed from memory-bank)
2. Enhance session_cache.md to track loaded modules
3. Update tasks.md to associate task types with recommended modules
4. Create transition scripts and guidelines

### Phase 4: Testing and Optimization (Days 8-10)
1. Conduct token usage testing and benchmarking
2. Validate across different task types and scenarios
3. Refine modules based on testing feedback
4. Create comprehensive documentation for new modular system
5. Develop user guide for module management

## Proposed Folder Structure

```
memory-bank/                            # Project root
├── core/
│   ├── core-rules.md                   # Essential instructions only (small footprint)
│   ├── command-reference.md            # Condensed command syntax reference
│   ├── quickstart.md                   # Minimal startup instructions
│   └── manifest.json                   # Module registry and metadata
│
├── modules/                            # Loadable rule modules
│   ├── documentation-rules.md          # Documentation standards and practices
│   ├── implementation-rules.md         # Code implementation standards
│   ├── memory-management-rules.md      # Memory Bank file management rules
│   ├── session-management-rules.md     # Session tracking and management
│   ├── task-management-rules.md        # Multi-task tracking and switching
│   ├── error-handling-rules.md         # Error logging and resolution
│   ├── tool-usage-rules.md             # Detailed tool usage guidelines
│   └── changelog.md                    # Version history for all modules
│
├── context-store/                      # Renamed from "memory-bank"
│   ├── activeContext.md
│   ├── edit_history.md
│   ├── errorLog.md
│   ├── progress.md
│   ├── session_cache.md                # Enhanced to track loaded modules
│   ├── tasks.md                        # Enhanced with module associations
│   └── ...
│
├── templates/                          # Unchanged templates directory
│   ├── ...
│
├── examples/                           # Examples moved outside the rules
│   ├── workflows/
│   │   ├── single-task-workflow.md
│   │   ├── multi-task-workflow.md
│   │   ├── module-management-workflow.md
│   │   └── error-resolution-workflow.md
│   ├── commands/
│   │   └── command-examples.md
│   └── templates/
│       └── filled-template-examples.md
│
├── docs/                               # Detailed documentation
│   ├── guides/
│   │   ├── task-switching-guide.md
│   │   ├── documentation-guide.md
│   │   ├── error-handling-guide.md
│   │   └── module-management-guide.md  # New guide for module system
│   └── specifications/
│       ├── file-format-specs.md
│       ├── command-specs.md
│       └── module-specs.md             # New specifications for modules
│
├── transition/                         # Transition support tools
│   ├── compatibility-layer.md          # Instructions for backward compatibility
│   ├── migration-guide.md              # Guide for transitioning to modular system
│   └── module-mapping.json             # Mapping between monolithic and modular rules
│
└── loader.md                           # Dynamic module loading instructions
```

## Technical Implementation Details

### Core Rules Structure
The core-rules.md file should be structured to provide essential context while minimizing size:

1. **Purpose and Philosophy** (condensed, ~10% of original size)
2. **Safety Guidelines** (unchanged, critical for operation)
3. **Minimal Command Reference** (most common commands only)
4. **Basic Document Structure** (minimal file templates)
5. **Module Loading Instructions** (how to request additional modules)

### Module Loading Commands

```
<load_module>
<module_name>documentation-rules</module_name>
</load_module>

<unload_module>
<module_name>error-handling-rules</module_name>
</unload_module>

<list_modules>
</list_modules>

<suggest_modules>
<task_id>T4</task_id>
</suggest_modules>
```

### Session Cache Enhancement
The session_cache.md file needs enhancement to track loaded modules:

```markdown
## Loaded Modules
- core-rules.md (v1.0.0) - Always loaded
- documentation-rules.md (v1.0.0) - Loaded at 2025-04-15 22:30 UTC
- implementation-rules.md (v1.0.0) - Loaded at 2025-04-15 22:35 UTC
```

### Task Type to Module Mapping
Create a mapping system to suggest relevant modules for specific task types:

```json
{
  "taskTypes": {
    "documentation": [
      "documentation-rules",
      "memory-management-rules"
    ],
    "implementation": [
      "implementation-rules",
      "tool-usage-rules",
      "error-handling-rules"
    ],
    "maintenance": [
      "session-management-rules",
      "memory-management-rules"
    ]
  }
}
```

## Next Steps
1. Begin by analyzing the current integrated-rules-v4.md to identify natural module boundaries
2. Develop initial core-rules.md with minimal essential context
3. Create the manifest.json structure for module tracking
4. Implement first set of core modules (documentation, implementation)
5. Update session_cache.md to track loaded modules
6. Develop and test the module loading/unloading commands
7. Create comprehensive testing scenarios to validate the approach

---

*This enhanced plan expands upon the original optimization approach and serves as a foundation for task T4: Optimize Integrated Rules for Token Efficiency. It incorporates additional requirements identified through memory bank file review, focusing on maintainability, compatibility, and efficient token usage.*