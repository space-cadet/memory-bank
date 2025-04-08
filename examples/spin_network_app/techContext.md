# Spin Network Visualization and Diffusion App - Technical Context

## Technology Stack

### Frontend Framework
- **React 18.2.0**: Component-based UI library
- **TypeScript 5.2.2**: Static typing for improved development experience
- **Vite 5.0.0**: Build tool for fast development and optimized production builds

### State Management
- **Redux Toolkit 1.9.7**: State management library
- **Redux Persist 6.0.0**: For state persistence across sessions
- **Localforage 1.10.0**: IndexedDB wrapper for improved storage capabilities
- **Custom History Tracking**: For undo/redo functionality

### Visualization Libraries
- **Cytoscape.js 3.26.0**: Core library for network visualization
- **D3.js 7.8.5**: For data visualization components (plots, charts)

### Mathematics and Simulation
- **Math.js 12.1.0**: Mathematical operations and matrix manipulations
- *(Planned)* **Numeric.js**: For numerical methods implementation

### UI Components and Styling
- **React Icons 4.12.0**: Icon components
- **Tailwind CSS 3.3.5**: Utility-first CSS framework
- **PostCSS 8.4.31**: CSS processing tool
- **Autoprefixer 10.4.16**: CSS vendor prefixing

### Development Tools
- **ESLint 8.53.0**: Code linting
- **Prettier 3.0.3**: Code formatting
- **pnpm 8.10.0**: Package manager (faster and more efficient than npm)

## Development Environment

- **Node.js**: v16 or newer
- **Package Manager**: pnpm v8 or newer
- **Build Commands**:
  - `pnpm dev`: Start development server
  - `pnpm build`: Build for production
  - `pnpm lint`: Run ESLint
  - `pnpm format`: Format code with Prettier

## Key Technical Components

### 1. Resizable Panel System

A custom implementation that allows users to resize UI panels:

```tsx
<ResizablePanel 
  direction="horizontal" 
  defaultSize={250} 
  minSize={200} 
  maxSize={400}
  handlePosition="end"
  className="border-r border-gray-200 bg-white overflow-y-auto"
>
  {/* Panel content */}
</ResizablePanel>
```

Key features:
- Supports both horizontal and vertical resizing
- Configurable min/max sizes
- Visual resize handles
- Maintains layout integrity during resize operations

### 2. Network Visualization

The core visualization is implemented using Cytoscape.js:

```tsx
const cyInstance = cytoscape({
  container: containerRef.current,
  elements: [...networkElements],
  style: [...networkStyles],
  layout: { name: 'grid' },
  userZoomingEnabled: true,
  userPanningEnabled: true,
  boxSelectionEnabled: true
});
```

Features:
- Interactive node/edge manipulation
- Zoom, pan, and selection capabilities
- Visual representation of network elements
- Event handling for user interactions

### 3. Simulation Controls

Interface for configuring and controlling diffusion simulations:

```tsx
<SimulationControls
  onStartSimulation={handleStartSimulation}
  parameters={{
    type: 'ordinary',
    alpha: 0.5,
    beta: 0.5,
    c: 1.0,
    timeStep: 0.01,
    totalTime: 10
  }}
/>
```

Supports:
- Different diffusion types (ordinary, finite-velocity)
- Parameter configuration
- Playback controls (start, pause, step, reset)

### 4. Data Visualization

Energy and simulation data visualization implemented using D3.js:

```tsx
<EnergyPlot 
  data={{
    time: [...timePoints],
    gravitational: [...gravEnergyValues],
    matter: [...matterEnergyValues],
    total: [...totalEnergyValues]
  }} 
/>
```

Features:
- Time series plotting
- Multiple data series visualization
- Interactive elements (tooltips, zoom)

## Technical Constraints

### Performance Considerations

1. **Rendering Performance**:
   - Large networks can impact rendering speed
   - Cytoscape.js optimization settings are crucial
   - Throttling updates for smooth user experience

2. **Calculation Efficiency**:
   - Diffusion simulations involve matrix operations that can be computationally intensive
   - Strategic use of web workers for heavy calculations
   - Optimized data structures for simulation state

3. **Storage Considerations**:
   - IndexedDB (via localforage) used for state persistence with improved storage limits
   - Large networks are stored efficiently using JSON serialization
   - File-based save/load implemented for explicit user control over network storage
   - Migration system in place for future state structure changes

### Proposed 3D Visualization Technologies

For the planned 3D network visualization capabilities, the following technologies are being considered:

1. **Three.js**:
   - WebGL-based 3D rendering library
   - Well-established with extensive documentation and community support
   - Provides comprehensive 3D capabilities including camera controls, materials, and lighting

2. **React Integration**:
   - **react-three-fiber**: React reconciler for Three.js
   - **drei**: Helper library with common Three.js components and controls
   - Enables declarative Three.js usage within React component structure

3. **Performance Optimization**:
   - Instanced rendering for nodes in large networks
   - Level-of-detail adjustments for complex visualizations
   - Throttled interaction during camera movement
   - WebWorkers for layout calculations

The proposed implementation would extend the current architecture while maintaining compatibility with existing network operations and state management.

### Browser Compatibility

- Target: Modern browsers with good WebGL support (Chrome, Firefox, Safari, Edge)
- Minimum specifications:
  - WebGL 1.0 support
  - ES6 compatibility
  - Modern CSS feature support
  - LocalStorage/IndexedDB support for persistence

### Responsive Design Challenges

- Maintaining usability on different screen sizes
- Handling resize events without performance degradation
- Preserving visualization quality when panels are resized
- Optimizing workspace with hideable panels
- Supporting keyboard shortcuts for important operations

## Development Practices

1. **Component Organization**:
   ```
   src/
   ├── components/
   │   ├── common/         # Shared components like ResizablePanel
   │   ├── layouts/        # Layout components
   │   ├── panels/         # Panel components
   │   ├── simulation/     # Simulation-related components
   │   ├── tools/          # Tool components
   │   ├── visualization/  # Visualization components
   │   └── workspace/      # Workspace components
   ├── styles/             # Global styles
   └── ...
   ```

2. **Type Safety**:
   - Comprehensive type definitions for all components and data structures
   - Strict TypeScript configuration

3. **Code Quality**:
   - ESLint and Prettier for consistent code style
   - Component-focused architecture
   - Clear separation of concerns

4. **Future-Proofing**:
   - Modular design allows for easy replacement of visualization libraries
   - Abstraction layers between data models and visualization
   - Configuration-driven approach for extensibility
