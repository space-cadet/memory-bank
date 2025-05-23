# Research Project Memory Bank - README
*Last Updated: May 23, 2025*

This folder contains a complete adaptation of the integrated memory bank system specifically designed for physics research projects and academic paper writing.

## Folder Structure

```
research-project-memory/
├── README.md                          # Comprehensive guide and file descriptions
├── integrated-rules-research-v1.md    # Complete research-adapted ruleset
└── templates/                         # 12 research-ready templates
    ├── activeContext.md               # Task focus tracking
    ├── bibTracker.md                  # Citation management (research-specific)
    ├── changelog.md                   # Research change tracking (adapted)
    ├── component_index.md             # Research component mapping (adapted)
    ├── edit_history.md                # File modification logging
    ├── errorLog.md                    # Error tracking
    ├── litReview.md                   # Literature analysis (research-specific)
    ├── progress.md                    # Task progress tracking
    ├── projectbrief.md                # Project overview
    ├── session_cache.md               # Session management
    ├── task-template.md               # Individual task template
    └── tasks.md                       # Task registry
```

## Core Documentation

### `integrated-rules-research-v1.md`
**Complete ruleset adapted for research projects.** Contains all memory bank principles, file structures, commands, and workflows modified for academic research context. Use this as the primary reference for implementing the memory bank system in research projects.

## Templates Directory (`templates/`)

The templates directory contains ready-to-use templates for all memory bank files in a research context.

### Core System Templates

#### `activeContext.md`
**Current task focus and working context.** Tracks which research tasks are active, current decisions being made, and immediate next actions. Use when you need to quickly resume work or switch between research tasks.

#### `session_cache.md`
**Multi-task session state management.** Maintains live snapshot of all active research tasks, their progress, critical files, and working context. Essential for managing complex research projects with multiple concurrent activities.

#### `tasks.md`
**Task registry and tracking system.** Central registry of all research tasks (write sections, literature review, data analysis, etc.) with status, priorities, and relationships. The command center for your research project.

#### `edit_history.md`
**File modification log with task references.** Chronological record of all file changes tied to specific research tasks. Invaluable for tracking what was changed when and why during the research process.

#### `errorLog.md`
**Error tracking and resolution.** Documents errors encountered (calculation mistakes, data issues, analysis problems) with causes, fixes, and task references. Helps avoid repeating mistakes.

#### `progress.md`
**Research implementation status.** Task-organized view of research progress showing completed steps, current work, and planned next steps. Provides clear overview of project advancement.

### Research-Specific Templates

#### `bibTracker.md`
**Citation management and tracking.** Tracks needed citations by section, recently added references, citation status, and research gaps. Essential for managing bibliography in academic papers and ensuring proper attribution.

#### `litReview.md`
**Research ideas and literature analysis.** Structured analysis of research themes, key findings, patterns, gaps, and future directions. Central repository for synthesizing and organizing literature knowledge.

### Project Organization Templates

#### `projectbrief.md`
**Project overview and structure.** High-level description of research goals, current status, key components, and organization. Provides project context and orientation for collaborators or future reference.

#### `component_index.md`
**Research component mapping.** Maps conceptual research components (paper sections, data files, analysis scripts) to their file locations. Essential for navigating complex research projects with multiple files and dependencies.

#### `changelog.md`
**Research change tracking.** Documents all notable changes to the research project using research-appropriate categories (added sections, revised methodology, fixed calculations, research progress). Maintains project evolution history.

### Task Management Templates

#### `task-template.md`
**Individual task file template.** Template for creating detailed task files in the `tasks/` directory. Each research task (write introduction, analyze data, derive equations) gets its own file based on this template.

## Usage Guidelines

### Getting Started
1. **Copy templates** to your research project's `memory-bank/` directory
2. **Customize** `projectbrief.md` with your specific research details
3. **Create initial tasks** using `task-template.md` for your research objectives
4. **Begin tracking** with `session_cache.md` and `activeContext.md`

### Daily Research Workflow
1. **Check** `activeContext.md` to see current focus
2. **Update** `session_cache.md` when switching tasks
3. **Log changes** in `edit_history.md` as you modify files
4. **Track progress** in `progress.md` as tasks advance

### Research-Specific Usage
- **Use** `bibTracker.md` when adding citations or planning literature needs
- **Update** `litReview.md` as you read papers and synthesize knowledge
- **Reference** `component_index.md` to navigate complex project structure
- **Document** in `changelog.md` when completing major research milestones

### File Relationships
- **Tasks**: Overview in `tasks.md`, detailed files in `tasks/` directory
- **Sessions**: Current state in `session_cache.md`, detailed sessions in `sessions/` directory  
- **Literature**: Citation tracking in `bibTracker.md`, analysis in `litReview.md`
- **Navigation**: Project map in `component_index.md`, changes in `changelog.md`

## Key Differences from Software Development Version

### Research-Adapted Elements
- **Terminology**: "Implementation" → "Research execution", "Features" → "Research objectives"
- **Task Examples**: Writing sections, literature review, data analysis vs. coding features
- **File Types**: LaTeX/tex files, data files, analysis scripts vs. source code
- **Version Control**: Draft versions and research milestones vs. software releases

### New Research Components
- **Bibliography management** (`bibTracker.md`)
- **Literature synthesis** (`litReview.md`)
- **Research-specific changelog** categories
- **Academic project structure** in component index

### Maintained Universal Elements
- **Core task management** system and workflows
- **Session and context tracking** mechanisms
- **Error logging** and resolution processes
- **Hierarchical file organization** principles

## Integration Notes

This research adaptation maintains full compatibility with the core memory bank principles while adapting terminology, examples, and specific components for academic research contexts. The system supports GitHub integration, collaborative research, and scales from individual papers to large research projects.

For questions about implementation or customization for specific research domains, refer to the detailed documentation in `integrated-rules-research-v1.md`.
