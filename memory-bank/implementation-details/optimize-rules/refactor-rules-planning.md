# Plan for Optimizing Integrated Rules to Reduce Token Usage

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

3. **Restructure Documentation Flow**
   - Move templates and detailed examples to external files.
   - Replace verbose workflows with minimal instructions and references.
   - Use concise summaries and pointers to detailed documentation.

4. **Optimize Command Structure**
   - Condense command descriptions.
   - Simplify parameter documentation.
   - Use shorthand notation where possible.

5. **Implement Progressive Disclosure**
   - Provide minimal instructions initially.
   - Allow mechanisms to request more detailed guidance or modules.

6. **Update Folder Structure**
   - Organize rules into modular directories (core, modules, context-store).
   - Maintain templates and examples separately.
   - Provide loader instructions for dynamic module management.

7. **Testing and Validation**
   - Measure token usage before and after optimization.
   - Validate that task execution remains consistent and reliable.
   - Iterate based on feedback and performance metrics.

## Expected Benefits
- Significant reduction in token usage per request.
- Improved maintainability and scalability of Integrated Rules.
- Enhanced flexibility to adapt rules based on task context.
- Better user experience with faster and more efficient LLM interactions.

## Next Steps
- Begin by modularizing the current Integrated Rules into Core and Extended modules.
- Develop dynamic loading mechanisms and update session management workflows.
- Refactor documentation and command descriptions accordingly.
- Update Memory Bank folder structure to reflect new organization.
- Conduct thorough testing and document results.

---

*This plan aligns with the previously discussed optimization approach and serves as a foundation for the new task T4: Optimize Integrated Rules for Token Efficiency.*

## Proposed Folder Structure

memory-bank/                            # Project root
├── core/
│   ├── core-rules.md                   # Essential instructions only (small footprint)
│   ├── command-reference.md            # Condensed command syntax reference
│   └── quickstart.md                   # Minimal startup instructions
│
├── modules/                            # Loadable rule modules
│   ├── documentation-rules.md          # Documentation standards and practices
│   ├── implementation-rules.md         # Code implementation standards
│   ├── memory-management-rules.md      # Memory Bank file management rules
│   ├── session-management-rules.md     # Session tracking and management
│   ├── task-management-rules.md        # Multi-task tracking and switching
│   ├── error-handling-rules.md         # Error logging and resolution
│   └── tool-usage-rules.md             # Detailed tool usage guidelines
│
├── context-store/                      # Renamed from "memory-bank"
│   ├── activeContext.md
│   ├── edit_history.md
│   ├── errorLog.md
│   ├── progress.md
│   ├── session_cache.md
│   ├── tasks.md
│   └── ...
│
├── templates/                          # Unchanged templates directory
│   ├── ...
│
├── examples/                           # Examples moved outside the rules
│   ├── workflows/
│   │   ├── single-task-workflow.md
│   │   ├── multi-task-workflow.md
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
│   │   └── error-handling-guide.md
│   └── specifications/
│       ├── file-format-specs.md
│       └── command-specs.md
│
└── loader.md                           # Dynamic module loading instructions