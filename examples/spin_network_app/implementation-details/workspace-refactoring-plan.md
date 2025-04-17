# Workspace.tsx Refactoring Plan (Updated)

*Updated: April 11, 2025*

## Current Issues

- Workspace.tsx has grown to 1400+ lines
- Mixes visualization, interaction, and UI control logic
- Difficult to maintain and test
- Tight coupling between different concerns

## Proposed Solution

Break down Workspace.tsx into focused components with clear responsibilities, while extracting specific functionality into utility modules and custom hooks.

### 1. CytoscapeManager.tsx
**Responsibilities**:
- Cytoscape initialization and lifecycle management
- Core visualization setup and configuration
- Viewport and zoom management
- Base styling and theming

**Key Interfaces**:
```typescript
interface CytoscapeManagerProps {
  network: NetworkState;
  styles: NetworkStyles;
  onViewportChange?: (viewport: Viewport) => void;
  onZoomChange?: (zoom: number) => void;
}
```

**Key Extractions**:
- `useCytoscapeInstance` hook for setup and teardown
- `cytoscapeSetup.ts` utility for configuration
- `viewportUtils.ts` for zoom and viewport operations

### 2. NetworkInteractionManager.tsx
**Responsibilities**:
- Node/edge selection and highlighting
- Drag-and-drop interactions
- Context menu handling
- Element creation/deletion

**Key Interfaces**:
```typescript
interface NetworkInteractionManagerProps {
  network: NetworkState;
  onSelect?: (elements: ElementDefinition[]) => void;
  onNodeCreate?: (position: {x: number, y: number}) => void;
  onEdgeCreate?: (source: string, target: string) => void;
  onDelete?: (elements: ElementDefinition[]) => void;
}
```

**Key Extractions**:
- `nodeHandlers.ts` for node-specific operations (creation, deletion)
- `edgeHandlers.ts` for edge-specific operations (creation, dangling edges)
- `canvasHandlers.ts` for canvas-level interactions
- `useNetworkInteractions` hook to manage interaction mode behavior

### 3. SimulationVisualizationManager.tsx
**Responsibilities**:
- Simulation state visualization
- Animation handling
- Time evolution display
- Results overlay

**Key Interfaces**:
```typescript
interface SimulationVisualizationManagerProps {
  simulation: SimulationState;
  network: NetworkState;
  onAnimationFrame?: (frame: number) => void;
  onVisualizationReady?: () => void;
}
```

**Key Extractions**:
- `useSimulationVisualization` hook for state transformation
- `visualizationUtils.ts` for color and size mapping
- `animationController.ts` for timing and playback

### 4. WorkspaceControls.tsx
**Responsibilities**:
- Toolbar buttons and controls
- View options toggles
- Layout selection
- Export/import UI

**Key Interfaces**:
```typescript
interface WorkspaceControlsProps {
  mode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  onLayoutChange?: (layout: LayoutType) => void;
  onExport?: (format: ExportFormat) => void;
  onImport?: (file: File) => void;
  onResetView?: () => void;
}
```

**Key Extractions**:
- `ToolbarButton.tsx` component for consistent button styling
- `StatusIndicator.tsx` for displaying current mode/status
- `toolbarActions.ts` for action handlers

### 5. NetworkStatusBar.tsx
**Responsibilities**:
- Display network statistics (nodes/edges count)
- Show current interaction mode
- Display guidance messages based on current operation

## Implementation Approach

1. **Component Creation and Extraction Strategy**:
   - Create the base component structure with proper interfaces
   - Extract specific functionality into utility modules and hooks
   - Incrementally move logic from Workspace.tsx to appropriate locations
   - Maintain working functionality throughout the process

2. **Data Flow**:
   ```mermaid
   graph TD
     Workspace.tsx --> CytoscapeManager
     Workspace.tsx --> NetworkInteractionManager
     Workspace.tsx --> SimulationVisualizationManager
     Workspace.tsx --> WorkspaceControls
     Workspace.tsx --> NetworkStatusBar
     CytoscapeManager --> Workspace.tsx[Viewport/Zoom Events]
     NetworkInteractionManager --> Workspace.tsx[Selection/Creation Events]
     SimulationVisualizationManager --> Workspace.tsx[Animation Events]
   ```

3. **State Management**:
   - Keep global state in Redux
   - Use hooks for local component state
   - Maintain single source of truth for network data
   - Use context where appropriate for sharing state between closely related components

## File Structure Changes

```
src/components/workspace/
├── Workspace.tsx (refactored)
├── CytoscapeManager/
│   ├── CytoscapeManager.tsx
│   ├── utils/
│   │   ├── cytoscapeSetup.ts
│   │   └── viewportUtils.ts
│   ├── hooks/
│   │   └── useCytoscapeInstance.ts
│   └── index.ts
├── NetworkInteractionManager/
│   ├── NetworkInteractionManager.tsx
│   ├── handlers/
│   │   ├── nodeHandlers.ts
│   │   ├── edgeHandlers.ts
│   │   └── canvasHandlers.ts
│   ├── hooks/
│   │   └── useNetworkInteractions.ts
│   └── index.ts
├── SimulationVisualizationManager/
│   ├── SimulationVisualizationManager.tsx
│   ├── utils/
│   │   ├── visualizationUtils.ts
│   │   └── animationController.ts
│   ├── hooks/
│   │   └── useSimulationVisualization.ts
│   └── index.ts
├── WorkspaceControls/
│   ├── WorkspaceControls.tsx
│   ├── components/
│   │   ├── ToolbarButton.tsx
│   │   └── StatusIndicator.tsx
│   ├── utils/
│   │   └── toolbarActions.ts
│   └── index.ts
└── NetworkStatusBar/
    ├── NetworkStatusBar.tsx
    └── index.ts
```

## Specific Function Extractions

The following specific functions will be extracted from Workspace.tsx:

### Node Operations (to nodeHandlers.ts)
- `handleAddNode`
- `createPlaceholderNode`
- `convertPlaceholderToNode`
- `deleteNode`
- Related event handlers

### Edge Operations (to edgeHandlers.ts)
- `createEdge`
- `createDanglingEdge`
- `deleteEdge`
- Related event handlers

### Canvas Operations (to canvasHandlers.ts)
- Click handlers for canvas background
- Mode-specific canvas behaviors

### Viewport Operations (to viewportUtils.ts)
- `safeFit`
- `handleZoomIn`
- `handleZoomOut`
- `handleZoomFit`

### Mode Handlers (to useNetworkInteractions.ts)
- `handleModeChange`
- `setupDeleteHandlers`
- Mode-specific event binding logic

## Migration Plan

1. **Phase 1: Structure Setup (Days 1-2)**
   - Create all directory structures and empty files
   - Set up component shells with interfaces
   - Create minimal implementations that render placeholders

2. **Phase 2: Utility Extraction (Days 3-4)**
   - Extract utility functions domain by domain
   - Implement and test each utility module
   - Create custom hooks for related functionality

3. **Phase 3: Manager Implementation (Days 5-7)**
   - Implement each manager component using the extracted utilities
   - Ensure proper props and state management
   - Create necessary sub-components

4. **Phase 4: Workspace Integration (Days 8-9)**
   - Refactor main Workspace.tsx to use the new components
   - Ensure proper data flow between components
   - Handle state and callbacks properly

5. **Phase 5: Testing and Refinement (Days 10-12)**
   - Comprehensive testing of all components
   - Performance optimization
   - Final cleanup and documentation

## Expected Benefits

- **Reduced Complexity**:
  - Workspace.tsx reduced from 1400+ to ~200-300 lines
  - Clear separation of concerns
  - Easier to reason about each component

- **Improved Maintainability**:
  - Isolated changes
  - Better test coverage
  - Clearer component boundaries

- **Enhanced Flexibility**:
  - Easier to modify individual features
  - Better support for future extensions
  - More reusable components

- **Better Developer Experience**:
  - Smaller files to work with
  - More focused responsibilities
  - Better organization of related code

## Testing Strategy

- **Unit Tests**:
  - Test each utility function independently
  - Test hooks with React Testing Library
  - Mock dependencies for isolated testing

- **Integration Tests**:
  - Test manager components with their utilities
  - Verify proper data flow between components
  - Test event handling and callbacks

- **Visual Regression Tests**:
  - Capture screenshots before and after refactoring
  - Verify UI consistency

## Risks and Mitigation

- **Risk**: Breaking existing functionality
  - **Mitigation**: Incremental migration with thorough testing at each step

- **Risk**: Performance impact with more component re-renders
  - **Mitigation**: 
    - Use React.memo for pure components
    - Optimize render cycles with useMemo and useCallback
    - Profile critical paths and optimize

- **Risk**: Increased bundle size
  - **Mitigation**: 
    - Code splitting and lazy loading
    - Monitor bundle size during development

- **Risk**: Increased complexity of state management
  - **Mitigation**:
    - Clear data flow documentation
    - Consistent patterns for state updates
    - Careful use of props vs. context
