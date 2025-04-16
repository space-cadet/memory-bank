# Task Management Rules

*Last Updated: April 16, 2025*

## Purpose
This module defines rules for managing multiple tasks and their lifecycle within the Integrated Code Rules and Memory Bank System.

## Multi-Task Tracking
- Maintain a task registry to track active, completed, and pending tasks.
- Support task dependencies and priorities.
- Enable task switching with context preservation.

## Task Creation and Updates
- Associate tasks with recommended modules for efficient context loading.
- Use suggest_modules command to get module recommendations.
- Update tasks.md with task details and module associations.

## Task Scheduling
- Prioritize tasks based on dependencies and urgency.
- Support deferred and cancelled task states.
- Provide mechanisms for task progress tracking.

## Integration
- Coordinate with session-management-rules for session consistency.
- Log task-related errors in errorLog.md.