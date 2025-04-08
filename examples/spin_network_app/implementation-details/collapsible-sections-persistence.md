# Collapsible Sections Persistence Implementation

This document outlines the technical implementation of persisting collapsible section states across sessions in the Spin Network application.

## Problem

Sidebar panels contain multiple collapsible sections that control the visibility of content blocks such as "Network Creation," "Diffusion Type," and other UI components. When the application was restarted, these collapsible sections would always reset to their default states, which affected the user experience by not preserving the user's preferred workspace configuration.

## Solution Overview

The solution involves moving the expanded/collapsed state management from local React state to Redux store, allowing it to be persisted between sessions using Redux Persist. This approach ensures consistent user experience across sessions.

## Technical Implementation

### 1. Redux State Extension

Extended the UI state slice to include a dedicated object for tracking collapsible section states:

```typescript
// Added to UIState interface in uiSlice.ts
collapsedSections: {
  [sectionId: string]: boolean;
}
```

The `collapsedSections` object uses a dictionary pattern where:
- Keys are unique identifiers for each collapsible section
- Values are boolean flags indicating whether the section is collapsed (true) or expanded (false)

### 2. Redux Actions

Added a dedicated action for toggling section collapsed state:

```typescript
// Toggle section collapse state
toggleSectionCollapsed: (
  state,
  action: PayloadAction<{ sectionId: string; collapsed?: boolean }>
) => {
  const { sectionId, collapsed } = action.payload;
  if (collapsed !== undefined) {
    state.collapsedSections[sectionId] = collapsed;
  } else {
    state.collapsedSections[sectionId] = !state.collapsedSections[sectionId];
  }
}
```

This action:
- Accepts a section ID and an optional collapsed state
- If the collapsed state is explicitly provided, it sets that value
- Otherwise, it toggles the current state

### 3. Redux Selectors

Added selectors to retrieve the collapsed state of sections:

```typescript
export const selectCollapsedSections = (state: RootState) => state.ui.collapsedSections;
export const selectSectionCollapsed = (sectionId: string) => (state: RootState) =>
  state.ui.collapsedSections[sectionId] || false;
```

### 4. Component Refactoring

Completely refactored the `CollapsibleSection` component to use Redux for state management:

```typescript
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
  iconClassName = '',
  id: propId,
}) => {
  const dispatch = useAppDispatch();
  
  // Generate a consistent ID for this section based on title
  const sectionId = propId || `section-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  // Get collapsed state from Redux
  const isCollapsed = useAppSelector(selectSectionCollapsed(sectionId));
  
  // Initialize the state on first render if needed
  useEffect(() => {
    // Only initialize if it's not already in Redux
    if (isCollapsed === undefined) {
      dispatch(toggleSectionCollapsed({ 
        sectionId, 
        collapsed: !defaultExpanded 
      }));
    }
  }, [dispatch, sectionId, defaultExpanded, isCollapsed]);

  const toggleExpand = () => {
    dispatch(toggleSectionCollapsed({ sectionId }));
  };

  return (
    <div className={`mb-4 border border-gray-200 rounded-md ${className}`}>
      <button
        className={`w-full flex items-center justify-between py-2 px-4 bg-gray-50 hover:bg-gray-100 text-left rounded-t-md ${headerClassName}`}
        onClick={toggleExpand}
      >
        <span className="font-medium">{title}</span>
        <span className={`transition-transform duration-200 ${iconClassName}`}>
          {!isCollapsed ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
        </span>
      </button>
      
      {!isCollapsed && (
        <div className={`p-4 rounded-b-md ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
};
```

Key improvements in the component:
- Automatic ID generation based on the section title if not explicitly provided
- Redux state management instead of local state
- Initialization effect to set default state on first render
- Delegating toggle actions to Redux

### 5. Persistence Configuration

Updated Redux Persist configuration to include the collapsedSections in the persisted whitelist:

```typescript
const uiPersistConfig = {
  key: 'ui',
  version: 1,
  storage: localforage,
  migrate: migrationFunction,
  whitelist: ['viewSettings', 'sidebarVisibility', 'sidebarSizes', 'collapsedSections']
};
```

### 6. Reset Functionality

Updated the settings reset functionality to also reset the collapsed sections:

```typescript
resetAllSettings: (state) => {
  state.viewSettings = initialState.viewSettings;
  state.sidebarVisibility = initialState.sidebarVisibility;
  state.sidebarSizes = initialState.sidebarSizes;
  state.collapsedSections = initialState.collapsedSections; // New line
  state.theme = initialState.theme;
  state.performanceSettings = initialState.performanceSettings;
}
```

## Implementation Details

### Section ID Generation

The component automatically generates a consistent ID for each section based on the title if not explicitly provided:

```typescript
const sectionId = propId || `section-${title.toLowerCase().replace(/\s+/g, '-')}`;
```

This guarantees that the same section always uses the same ID across sessions, even if not explicitly provided.

### Initial State Handling

On first render, the component checks if a state already exists in Redux for the section:

```typescript
useEffect(() => {
  if (isCollapsed === undefined) {
    dispatch(toggleSectionCollapsed({ 
      sectionId, 
      collapsed: !defaultExpanded 
    }));
  }
}, [dispatch, sectionId, defaultExpanded, isCollapsed]);
```

If not defined, it initializes based on the `defaultExpanded` prop, ensuring that components can still specify their preferred initial state for first-time usage.

## Benefits

1. **Consistent User Experience**: The application remembers user preferences for UI layout
2. **Improved Workflow**: Users don't need to reconfigure their workspace each session
3. **Better Productivity**: Minimizes repetitive actions of expanding/collapsing sections

## Future Improvements

1. **Section Groups**: Add support for section groups that can be collapsed/expanded together
2. **Restore Defaults**: Add a button to restore default expansion states for sections
3. **Context-aware Expansion**: Expand relevant sections based on user actions

## Related Components

- `NetworkTools.tsx`: Contains multiple collapsible sections for different network operations
- `SimulationControls.tsx`: Has collapsible sections for simulation parameters
- `PropertiesPanel.tsx`: Uses collapsible sections for different property groupings
