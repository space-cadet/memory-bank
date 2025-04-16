# Instructions for Using the Modular Rules Manifest

This document provides guidance for the LLM on how to interpret and utilize the `manifest.json` file located at `optimized-rules/core/manifest.json`. The manifest serves as the central index for the modular rule set.

## Purpose of the Manifest

- The manifest lists all modular rule files (modules) with their:
  - Names
  - Versions
  - Descriptions
  - Dependencies on other modules

- It acts as a map to understand the modular structure and relationships between rule files.

## How to Use the Manifest

1. **Load the Manifest**  
   Always load the `manifest.json` file first to understand the available modules and their dependencies.

2. **Identify Relevant Modules**  
   Based on the current task or context, determine which modules are relevant. Use the module names and descriptions to guide this selection.

3. **Resolve Dependencies**  
   For each selected module, check its dependencies listed in the manifest. Ensure all dependent modules are also included to maintain consistency.

4. **Load Module Contents**  
   Retrieve and load the full content of the selected modules and their dependencies. These contents contain the detailed rules and instructions needed.

5. **Optimize Context Size**  
   Avoid loading modules that are not relevant to the current task to minimize context size and improve efficiency.

6. **Apply Rules**  
   Use the loaded modular rules to guide behavior, decision-making, and task execution according to the system’s standards.

## Summary

- The manifest is the single source of truth for module structure.
- It enables dynamic, context-aware loading of modular rules.
- Proper use of the manifest supports modularity, scalability, and efficient LLM operation.

---

*Last Updated: April 16, 2025*