# GitHub Projects Setup Guide
*Last Updated: 2025-05-17*

## Prerequisites
- GitHub CLI (gh) installed and authenticated
- Access to target GitHub repository
- Memory Bank system initialized

## Setup Steps

### 1. Project Creation
First, create the project through the GitHub web interface. Note the project number (e.g., 2).

### 2. Custom Field Configuration
Add the required custom fields to match Memory Bank's task structure:

```bash
# Add Task ID field
gh project field-create 2 --name "Task ID" --data-type TEXT

# Add Priority field with options
gh project field-create 2 --name "Priority" --data-type SINGLE_SELECT --single-select-options "High,Medium,Low"

# Add date fields
gh project field-create 2 --name "Started Date" --data-type DATE
gh project field-create 2 --name "Last Active" --data-type DATE

# Add relationship fields
gh project field-create 2 --name "Dependencies" --data-type TEXT
gh project field-create 2 --name "Memory Bank File" --data-type TEXT
```

### 3. Label Creation
Create labels for Memory Bank tiers (replace `owner/arxivite-memory` with your repository):

```bash
# Create tier labels
gh label create bootstrap -R owner/arxivite-memory --color 0366d6 --description "Bootstrap tier tasks"
gh label create critical -R owner/arxivite-memory --color d73a4a --description "Critical tier tasks"
gh label create essential -R owner/arxivite-memory --color 28a745 --description "Essential tier tasks"
gh label create reference -R owner/arxivite-memory --color 6f42c1 --description "Reference tier tasks"
```

### 4. Milestone Creation
Create milestones for tracking sessions:

```bash
# Create milestone for current session
gh api -X POST /repos/{owner}/arxivite-memory/milestones \
  --field title="Session $(date +%Y-%m-%d)-morning" \
  --field state=open \
  --field description="Morning session tasks" \
  --field due_on="$(date -v+1d +%Y-%m-%dT23:59:59Z)"

# For Linux systems, use this date command instead:
# --field due_on="$(date -d 'tomorrow' +%Y-%m-%dT23:59:59Z)"
```

## View Configuration
Views must be configured through the GitHub web interface. Set up:

1. Board View:
   - Columns: 
     - ⬜ To Do
     - 🔄 In Progress
     - ⏸️ Paused
     - ✅ Completed

2. Table View:
   - Include all custom fields
   - Sort by Priority and Started Date

## Status Mapping

| Memory Bank | GitHub Project |
|-------------|----------------|
| ⬜ TO DO    | To Do         |
| 🔄 IN PROGRESS | In Progress   |
| ⏸️ PAUSED    | Paused        |
| ✅ COMPLETED | Completed     |

## Field Usage Guidelines

1. **Task ID**
   - Format: T[number] (e.g., T1, T2)
   - Must match Memory Bank task ID

2. **Priority**
   - HIGH: Critical path tasks
   - MEDIUM: Important but not blocking
   - LOW: Nice to have

3. **Dates**
   - Started Date: When task was created
   - Last Active: Last modification date

4. **Dependencies**
   - Comma-separated task IDs
   - Example: "T1, T2, T3"

5. **Memory Bank File**
   - Relative path from project root
   - Example: "tasks/T1.md"

## Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   # Check gh authentication status
   gh auth status
   
   # Refresh token with required scopes
   gh auth refresh -h github.com -s project
   ```

2. **Rate Limiting**
   - Space out commands by a few seconds
   - Use batch operations where possible

3. **Field Creation Failures**
   - Verify project number is correct
   - Check for duplicate field names
   - Ensure data type is valid

### Validation

After setup, verify configuration:

```bash
# Check project fields
gh project field-list 2

# Check labels
gh label list -R owner/arxivite-memory

# Check milestones
gh api /repos/{owner}/arxivite-memory/milestones
```

## Templates
See [templates/](templates/) directory for:
- [Issue Template](templates/issue.md)
- [Task Template](templates/task.md)