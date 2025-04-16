# Command Reference

*Last Updated: April 16, 2025*

This document provides a condensed reference for command syntax used in the modular Integrated Rules system.

## Module Management Commands
- Load a module:
  ```
  <load_module>
  <module_name>module-name</module_name>
  </load_module>
  ```

- Unload a module:
  ```
  <unload_module>
  <module_name>module-name</module_name>
  </unload_module>
  ```

- List all modules:
  ```
  <list_modules>
  </list_modules>
  ```

- Suggest modules for a task:
  ```
  <suggest_modules>
  <task_id>T4</task_id>
  </suggest_modules>
  ```

## Task Management Commands
- Add a task
- Update a task
- Remove a task
(Refer to task-management-rules.md for details)

## Error Handling Commands
- Log errors
- Update error logs
(Refer to error-handling-rules.md for details)

## Tool Usage Commands
- Use tools with structured JSON input and output
(Refer to tool-usage-rules.md for details)
