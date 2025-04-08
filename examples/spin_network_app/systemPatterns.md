# Spin Network Visualization and Diffusion App - System Patterns

## Architecture Overview

The application follows a component-based architecture with clear separation of concerns:

```
                  ┌─────────────────┐
                  │    App State    │
                  │    (Redux)      │
                  └─────────────────┘
                          │
                          ▼
┌─────────────┐   ┌─────────────────┐   ┌─────────────┐
│  Network    │   │                 │   │ Simulation  │
│  Creation   │◄──┤  Main App       ├──►│ Control     │
│  Components │   │  Container      │   │ Components  │
└─────────────┘   └─────────────────┘   └─────────────┘
                          │
                          ▼
                  ┌─────────────────┐
                  │  Visualization  │
                  │  Components     │
                  └─────────────────┘
```

## Key Design Patterns

### 1. Component Composition

The UI is built using a composition of smaller, focused components:

- **Container Components**: Manage state and data flow
- **Presentational Components**: Handle rendering and user interaction
- **Layout Components**: Manage application structure and resizable panels
- **Interactive Controls**: Handle user input and provide feedback
- **Type Management Components**: Handle creation and customization of node and edge types

This approach promotes reusability and simplifies testing and maintenance.

### 2. Command History Pattern

The application implements the Command History pattern for undo/redo functionality:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Command     │    │ Command     │    │ Current     │
│ History     │    │ Execution   │    │ State       │
└─────────────┘    └─────────────┘    └─────────────┘
      ▲ ▼                ▲                   │
      │                  │                   │
      │                  │                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Undo/Redo   │◄───┤ Redux       │◄───┤ User        │
│ Controls    │    │ Actions     │    │ Interaction │
└─────────────┘    └─────────────┘    └─────────────┘
```

This pattern:
- Tracks all network-modifying operations
- Maintains a history stack with current index
- Allows reverting to previous states (undo)
- Allows reapplying reverted operations (redo)
- Optimizes by storing only needed state changes

### 3. Resizable and Hideable Panel Pattern

A key architectural pattern is the resizable and hideable panel system:

```
┌─────────────────────────────────────────────────────┐
│ MainLayout                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Header                                          │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌───────────┐ ┌───────────────────┐ ┌───────────┐ │
│ │ ◀ Toggle  │ │                   │ │  Toggle ▶ │ │
│ │           │ │                   │ │           │ │
│ │  Left     │ │     Main          │ │  Right    │ │
│ │  Sidebar  │ │     Content       │ │  Sidebar  │ │
│ │  Panel    │ │     Panel         │ │  Panel    │ │
│ │           │ │                   │ │           │ │
│ │  Resize   │ │                   │ │  Resize   │ │
│ │  Handle ▶ │ ├───────────────────┤ │ ◀ Handle  │ │
│ │           │ │  Bottom Panel     │ │           │ │
│ └───────────┘ └───────────────────┘ └───────────┘ │
│                    ▲ Toggle                        │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Footer                                          │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

- Each panel can be resized by the user with resize handles
- Panels can be hidden/shown with toggle buttons
- Panels communicate size changes to maintain a responsive layout
- Content within panels adapts to available space
- Panel visibility state is persisted between sessions

### 3. State Management

The application uses a centralized state management approach:

- **Global State**: Application-wide state managed by Redux
- **Component State**: Local state for UI-specific concerns
- **Derived State**: Calculated from the global state for visualization
- **Persistent State**: State preserved between sessions using Redux Persist
- **History State**: Tracks operations for undo/redo functionality

#### History Tracking Pattern

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ User Action  │───►│ Store Action │───►│ State Update │
└──────────────┘    └──────────────┘    └──────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐    ┌──────────────┐
                    │ Add to       │◄───┤ Persist to   │
                    │ History Stack│    │ Storage      │
                    └──────────────┘    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Update Undo/ │
                    │ Redo State   │
                    └──────────────┘
```

### 4. Event-Driven Interaction

User interactions follow an event-driven pattern:

1. User initiates action (e.g., selecting a node)
2. Component generates event
3. Event handlers update state
4. State changes are tracked in history (for undo/redo)
5. UI re-renders to reflect changes
6. Changes are persisted to storage

#### Sidebar Visibility Pattern

```
┌──────────────────────────────────────────────────────┐
│ MainLayout                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Header                                          │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────┐ ┌───────────────────┐ ┌─────────┐      │
│ │         │ │                   │ │         │      │
│ │ Toggle  │ │                   │ │ Toggle  │      │
│ │ Button◄─┼─┤     Main          ├─┼─►Button │      │
│ │         │ │     Content       │ │         │      │
│ │         │ │     Panel         │ │         │      │
│ │         │ │                   │ │         │      │
│ │         │ │                   │ │         │      │
│ │         │ ├───────────────────┤ │         │      │
│ │         │ │  Toggle Button    │ │         │      │
│ └─────────┘ └───────────────────┘ └─────────┘      │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Footer                                          │ │
│ └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

This pattern allows users to toggle the visibility of panels to maximize workspace area.

### 5. Graph Data Structure

Spin networks are represented using a graph data structure:

```typescript
interface Node {
  id: string;
  position: { x: number, y: number };
  intertwiner: number | null;
  type?: string; // Node type identifier for styling
  properties: Record<string, any>;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  spin: number;
  type?: string; // Edge type identifier for styling
  properties: Record<string, any>;
}

interface SpinNetwork {
  nodes: Node[];
  edges: Edge[];
  metadata: { /* network metadata */ };
}
```

This structure is optimized for visualization with Cytoscape.js and for diffusion calculations. 
The type field allows for dynamic styling based on node and edge types defined in the Type Management system.

## Component Relationships

### Network Visualization Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Network Data │───►│ Cytoscape.js │───►│ Rendered     │
│ Model        │    │ Adapter      │    │ Network      │
└──────────────┘    └──────────────┘    └──────────────┘
       ▲                  ▲                    │
       │                  │                    │
       │                  │                    │
       │            ┌──────────────┐           │
       │            │ Type         │           │
       │            │ Registry     │           │
       │            └──────────────┘           │
       │                                       │
       └───────────────────────────────────────┘
                  User Interaction
```

The Type Registry provides styling information to the Cytoscape.js Adapter, which applies the appropriate visual properties to each node and edge based on its assigned type.

### Simulation Data Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Simulation   │───►│ Numerical    │───►│ Simulation   │
│ Parameters   │    │ Solver       │    │ Results      │
└──────────────┘    └──────────────┘    └──────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Visualization│
                                       │ Components   │
                                       └──────────────┘
```

## Technical Constraints and Decisions

1. **Browser Compatibility**: The application targets modern browsers with WebGL support for optimal visualization performance.

2. **Performance Considerations**:
   - Network size is limited by browser rendering capabilities
   - Heavy calculations are optimized or offloaded to Web Workers when possible
   - Visualization updates are throttled for large networks

3. **Accessibility**:
   - Resizable panels improve usability across different screen sizes
   - Keyboard navigation for core functionality
   - Color schemes consider color blindness

4. **Synchronization**:
   - UI updates are synchronized with simulation steps
   - Visualization components respond to window/panel resize events

## Proposed 3D Visualization Architecture

For visualizing non-planar graphs, a 3D network viewer is being considered with the following architectural approach:

```
┌─────────────────────┐
│                     │
│   NetworkViewer     │
│   (Container)       │
│                     │
└─────────────┬───────┘
              │
              ▼
┌─────────────┴───────┐
│                     │
│   ViewerSelector    │
│                     │
└─┬───────────────────┘
  │
  ├─────────────┬─────────────┐
  │             │             │
  ▼             ▼             ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│         │ │         │ │         │
│ 2D View │ │ 3D View │ │ 2.5D    │
│         │ │         │ │ View    │
│         │ │         │ │         │
└─────────┘ └─────────┘ └─────────┘
```

### Technology Options

The 3D visualization would extend the current architecture with:

1. **Core Rendering Library**:
   - Three.js for full 3D WebGL rendering capabilities
   - react-three-fiber for React integration
   - drei for common 3D controls and helpers

2. **Data Adaptation Pattern**:
   - Adapter between network data model and 3D visualization
   - Consistent mapping of network properties to visual elements
   - Synchronization between 2D and 3D representations

3. **Layout Algorithms**:
   - 3D force-directed layouts for non-planar graphs
   - 3D hierarchical layouts for structured networks
   - Spherical layouts for certain network types

4. **User Interaction Model**:
   - Orbit controls for network rotation and exploration
   - 3D selection and manipulation capabilities
   - Consistent operation between 2D and 3D modes

### State Management Extension

The Redux state would be extended with:

```typescript
interface ViewState {
  viewMode: '2d' | '3d' | '2.5d';
  camera3D: {
    position: { x: number, y: number, z: number };
    target: { x: number, y: number, z: number };
    zoom: number;
  };
  layout3D: {
    algorithm: '3d-force' | '3d-hierarchical' | 'spherical';
    settings: Record<string, any>;
  };
}
```

### Visualization Component Structure

The 3D visualization would follow this component structure:

```
┌─────────────────────────┐
│ ThreeNetworkViewer      │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Scene               │ │
│ │ ┌─────────────────┐ │ │
│ │ │ Camera Controls │ │ │
│ │ └─────────────────┘ │ │
│ │ ┌─────────────────┐ │ │
│ │ │ Nodes           │ │ │
│ │ └─────────────────┘ │ │
│ │ ┌─────────────────┐ │ │
│ │ │ Edges           │ │ │
│ │ └─────────────────┘ │ │
│ │ ┌─────────────────┐ │ │
│ │ │ Visual Helpers  │ │ │
│ │ └─────────────────┘ │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```
