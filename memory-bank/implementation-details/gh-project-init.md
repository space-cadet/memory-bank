# GitHub Project Initialization Guide
*Last Updated: 2025-05-17*

This guide provides the exact gh CLI commands needed to initialize a GitHub Project structure compatible with the Memory Bank system.

## Prerequisites
- GitHub CLI (gh) installed and authenticated
- Access to target GitHub repository
- Memory Bank system initialized

## Commands

### 1. Custom Field Creation
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

### 2. Label Creation
```bash
# Create tier labels
gh label create bootstrap -R owner/arxivite-memory --color 0366d6 --description "Bootstrap tier tasks"
gh label create critical -R owner/arxivite-memory --color d73a4a --description "Critical tier tasks"
gh label create essential -R owner/arxivite-memory --color 28a745 --description "Essential tier tasks"
gh label create reference -R owner/arxivite-memory --color 6f42c1 --description "Reference tier tasks"
```

### 3. Milestone Creation
```bash
# Create milestone for current session
gh api -X POST /repos/{owner}/arxivite-memory/milestones \
  --field title="Session $(date +%Y-%m-%d)-morning" \
  --field state=open \
  --field description="Morning session tasks" \
  --field due_on="$(date -v+1d +%Y-%m-%dT23:59:59Z)"

# For Linux systems:
# --field due_on="$(date -d 'tomorrow' +%Y-%m-%dT23:59:59Z)"
```

## Status Mapping

| Memory Bank | GitHub Project |
|-------------|----------------|
| ⬜ TO DO    | To Do         |
| 🔄 IN PROGRESS | In Progress   |
| ⏸️ PAUSED    | Paused        |
| ✅ COMPLETED | Completed     |

## Required Web Interface Configuration

1. Board View:
   - Create columns matching status mapping above
   - Enable automated status updates

2. Table View:
   - Include all custom fields
   - Sort by Priority and Started Date

## Validation

```bash
# Check project fields
gh project field-list 2

# Check labels
gh label list -R owner/arxivite-memory

# Check milestones
gh api /repos/{owner}/arxivite-memory/milestones
```

For detailed integration documentation, see the [GitHub integration guide](github-integration/README.md).