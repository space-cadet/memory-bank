# Standalone Library Planning Document

*Created: April 16, 2025*

This document outlines planning for improvements to the standalone simulation library and test page.

## Table of Contents

1. [Numerical Stability and Graph Configuration Plan](#numerical-stability-and-graph-configuration-plan)
2. [Standalone Test Page Refactoring Plan](#standalone-test-page-refactoring-plan)

---

## Numerical Stability and Graph Configuration Plan

### Current Status Analysis

1. **Numerical Stability Improvements Already Implemented:**
   - Integrated SimulationLogger with stability monitoring
   - Implemented state normalization to prevent numerical explosion
   - Added STATE_NORMALIZED event type and handling
   - Added automatic normalization with configurable frequency
   - Reduced stability threshold from 1e6 to 1e4 for earlier detection
   - Implemented _setCurrentState method for state normalization

2. **Graph Configuration Improvements Already Implemented:**
   - Added graph type selector (custom, line, ring, grid, random)
   - Implemented node count control
   - Added edge spin assignment options (fixed or random)
   - Created graph generator functions for various topologies
   - Added diffusion model selection (ordinary vs telegraph)
   - Added solver method selection (euler, midpoint, rk4)
   - Added time step and diffusion coefficient controls

3. **Remaining Issues:**
   - RK4 solver implementation needs improvements for better stability
   - The telegraph equation model is simplified and not properly implemented
   - No adaptive time-stepping or stability-based step size adjustment
   - No test scripts to systematically evaluate numerical stability
   - Missing documentation on stability control and parameters
   - No fine-tuning of stability parameters for different graph types

### Detailed Plan

#### 1. Complete RK4 Solver Implementation

The current RK4 implementation is correct in principle but should be enhanced to handle stability better for stiff equations:

1. Add stability analysis functions to detect stiff behavior
2. Implement error estimation for the RK4 method
3. Add automatic step size control based on stability analysis
4. Implement proper handling of boundary conditions
5. Add improved RK4 implementation with better numerics

#### 2. Properly Implement Telegraph Equation Model

The telegraph equation model currently uses a simplified approach that doesn't truly represent the wave-like behavior:

1. Implement proper second-order ODE solver for the telegraph equation
2. Add proper damping term handling to avoid oscillations
3. Implement state vector velocity component for the wave equation
4. Complete the TelegraphDiffusionModel implementation
5. Add stability checks specific to second-order equations

#### 3. Implement Adaptive Time-Stepping

Add adaptive time-stepping to automatically adjust for stability:

1. Complete the AdaptiveRKF45Solver implementation
2. Add error estimation and step size adjustment
3. Implement a controller for time step selection
4. Add configuration options in the UI for error tolerance
5. Integrate adaptive time-stepping with the simulation engine

#### 4. Create Test Scripts for Numerical Stability Evaluation

Develop test scripts to systematically evaluate stability:

1. Create test cases with different graph topologies
2. Implement benchmarks for different solver methods
3. Add long-running stability tests
4. Create visual indicators of stability issues
5. Add automated test scripts for continuous integration

#### 5. Fine-tune Stability Parameters

Optimize stability parameters for different graph types:

1. Analyze stability characteristics of different graph topologies
2. Determine optimal normalization frequency for each graph type
3. Set appropriate stability thresholds for different numerical methods
4. Adjust diffusion coefficients based on graph connectivity
5. Create presets for different simulation scenarios

#### 6. Add Comprehensive Documentation

Create documentation on stability control and configuration:

1. Add detailed comments explaining stability mechanisms
2. Create usage examples for different graph types
3. Document best practices for configuring simulations
4. Add visual guides for stability parameter tuning
5. Update the UI with helpful tooltips and recommendations

### Implementation Priority Order

1. Fix and improve RK4 solver implementation (highest priority)
2. Implement proper telegraph equation model (high priority)
3. Add adaptive time-stepping (medium priority)
4. Fine-tune stability parameters for different graph types (medium priority)
5. Create test scripts for stability evaluation (medium priority)
6. Add comprehensive documentation (low priority)

### Success Criteria

The improvements will be considered successful when:

1. Simulations remain stable across all graph types, even with long run times
2. State normalization is properly controlled and documented
3. Different solver methods show appropriate accuracy-stability tradeoffs
4. Telegraph equation simulations show proper wave-like behavior
5. Users have clear guidance on parameter selection for stability
6. The standalone test page provides intuitive configuration options

---

## Standalone Test Page Refactoring Plan

The current standalone-test.js file is approximately 750 lines long and handles many different responsibilities, making it difficult to maintain. This plan outlines a refactoring approach to improve modularity and maintainability.

### Proposed File Structure

```
/public/
  /js/
    /standalone/
      - main.js               # Main entry point
      - domElements.js        # DOM element references
      - consoleLogger.js      # Console logging functionality
      - graphGenerators.js    # Graph generation functions
      - visualization.js      # Canvas visualization code
      - simulationHandlers.js # Simulation control event handlers
      - animationLoop.js      # Animation and simulation loop
      - metrics.js            # Calculation of simulation metrics
      - formatters.js         # Value formatting utilities
```

### Component Breakdown

#### 1. domElements.js (50 lines)
- Purpose: Centralize all DOM element references
- Contents:
  - Export all DOM element constants
  - Group by function (control buttons, configuration inputs, results displays)

#### 2. consoleLogger.js (60 lines)
- Purpose: Handle console output capture and logging
- Contents:
  - `setupConsoleCapture()` function
  - `log()` and `logError()` functions
  - Functions to format different data types for display

#### 3. graphGenerators.js (175 lines)
- Purpose: Generate different graph topologies
- Contents:
  - `GraphGenerators` object with methods for each topology:
    - `custom()`: The existing 5-node example
    - `line()`: Linear chain generation
    - `ring()`: Ring topology
    - `grid()`: Grid topology
    - `random()`: Random graph generator

#### 4. visualization.js (120 lines)
- Purpose: Handle graph visualization
- Contents:
  - `drawGraph()` function
  - Canvas utility functions
  - Node and edge rendering functions
  - Scaling and layout utilities

#### 5. simulationHandlers.js (150 lines)
- Purpose: Handle simulation control events
- Contents:
  - `handleCreateGraph()`: Graph creation
  - `handleRunSimulation()`: Start simulation
  - `handlePauseSimulation()`: Pause simulation
  - `handleContinueSimulation()`: Continue paused simulation
  - `handleResetSimulation()`: Reset simulation
  - `handleStepComplete()`: Step completion event handler
  - `handleSimulationComplete()`: Simulation completion event handler

#### 6. animationLoop.js (40 lines)
- Purpose: Manage animation and simulation loop
- Contents:
  - `startAnimationLoop()`: Start animation
  - `updateAnimation()`: Animation frame update
  - `stopAnimationLoop()`: Stop animation

#### 7. metrics.js (80 lines)
- Purpose: Calculate simulation metrics
- Contents:
  - `updateResults()`: Update all metrics
  - Functions for individual metrics:
    - Volume calculation
    - Area calculation
    - Dimension calculation
    - Entropy calculation
  - Stability monitoring and normalization

#### 8. formatters.js (25 lines)
- Purpose: Format values for display
- Contents:
  - `formatValue()`: Format numeric values
  - `formatExponential()`: Format large numbers as exponential

#### 9. main.js (50 lines)
- Purpose: Coordinate components and initialize the application
- Contents:
  - Import all modules
  - `initializePage()` function
  - Event listener setup
  - Global state management

### Implementation Approach

1. **Create Directory Structure**:
   - Create `/public/js/standalone/` directory
   - Create placeholder files for each module

2. **Extract DOM Elements**:
   - Move all DOM element references to domElements.js
   - Update references throughout the codebase

3. **Extract Console Logging**:
   - Move console capture and logging to consoleLogger.js
   - Ensure logging works with all other components

4. **Extract Graph Generators**:
   - Move the GraphGenerators object to graphGenerators.js
   - Make changes to use imported functions

5. **Extract Visualization**:
   - Move drawing functions to visualization.js
   - Update references to use imported visualization

6. **Extract Simulation Handlers**:
   - Move event handler functions to simulationHandlers.js
   - Update references and event listeners

7. **Extract Animation Loop**:
   - Move animation functions to animationLoop.js
   - Ensure proper coordination with simulation control

8. **Extract Metrics**:
   - Move calculation functions to metrics.js
   - Update references from visualization and handlers

9. **Extract Formatters**:
   - Move formatting functions to formatters.js
   - Update references throughout the codebase

10. **Create Main Module**:
    - Create main.js to coordinate all components
    - Update HTML to use main.js as the entry point

### Module Dependencies

```
main.js
  ├── domElements.js
  ├── consoleLogger.js
  ├── graphGenerators.js
  ├── visualization.js (depends on formatters.js)
  ├── simulationHandlers.js (depends on consoleLogger.js, graphGenerators.js, 
  │                           animationLoop.js, metrics.js)
  ├── animationLoop.js (depends on metrics.js)
  ├── metrics.js (depends on formatters.js, visualization.js)
  └── formatters.js
```

### Benefits of this Approach

1. **Improved Maintainability**: Each module has a clear, single responsibility
2. **Better Organization**: Related functionality is grouped together
3. **Easier Testing**: Smaller modules can be tested in isolation
4. **Reduced Complexity**: Smaller files are easier to understand
5. **Better Collaboration**: Different team members can work on different modules
6. **Easier Extensions**: New features can be added by extending specific modules
7. **Improved Performance**: Modules can be loaded as needed

### Integration with Existing HTML

The HTML file would need to be updated to load the modularized JavaScript:

```html
<!-- Current: -->
<script src="standalone-test.js"></script>

<!-- New approach: -->
<script type="module" src="/js/standalone/main.js"></script>
```

This would require adding `type="module"` to enable ES modules, and updating the script path to point to the new main.js entry point. The main.js file would import all other modules and initialize the application.

### State Management Considerations

Since the code currently uses global variables to maintain state, we would need to consider how to manage state across modules. Options include:

1. Create a shared state module that other modules can import
2. Pass state as parameters between functions
3. Implement a simple pub/sub pattern for state changes

For this refactoring, a shared state module would likely be the simplest approach, minimizing changes to the existing logic while still improving modularity.
