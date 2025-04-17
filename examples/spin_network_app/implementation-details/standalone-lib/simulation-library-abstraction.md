# Spin Network Simulation Library Abstraction Plan

*Created: April 14, 2025*

## 1. Overview

This document outlines the plan to abstract the simulation functionality from the UI components in the Spin Network App. The goal is to create standalone libraries that users could import into their code to run simulations on spin networks without any UI dependencies.

## 2. Project Structure

The new structure will consist of:

```
spin_network_app/
├── lib/                                 # New directory for standalone libraries
│   ├── core/                            # Core simulation functionality
│   │   ├── index.ts                     # Main entry point for core library
│   │   ├── types.ts                     # Core type definitions
│   │   ├── graph.ts                     # Graph implementation
│   │   ├── stateVector.ts               # State vector implementation
│   │   ├── mathAdapter.ts               # Math adapter for calculations
│   │   └── engineImplementation.ts      # Simulation engine implementation
│   │
│   ├── models/                          # Simulation models
│   │   ├── index.ts                     # Main entry point for models
│   │   ├── diffusionModels.ts           # Diffusion model implementations
│   │   ├── solvers.ts                   # Numerical solver implementations
│   │   └── weightFunctions.ts           # Weight function implementations
│   │
│   ├── analysis/                        # Analysis tools
│   │   ├── index.ts                     # Main entry point for analysis
│   │   ├── conservation.ts              # Conservation law checks
│   │   ├── geometricProps.ts            # Geometric property calculations
│   │   └── statistics.ts                # Statistical analysis tools
│   │
│   ├── adapters/                        # Optional visualization adapters
│   │   ├── index.ts                     # Main entry point for adapters
│   │   ├── visualizationTypes.ts        # Common visualization types
│   │   └── cytoscapeAdapter.ts          # Cytoscape.js adapter
│   │
│   ├── utils/                           # Utility functions
│   │   ├── index.ts                     # Main entry point for utilities
│   │   └── simulationLogger.ts          # Logging functionality
│   │
│   ├── index.ts                         # Main library entry point
│   └── package.json                     # Library package configuration
│
├── src/                                 # Original source code
│   ├── ...                              # (existing structure)
│   ├── simulation/                      # Will be refactored to use the lib
│   │   └── ...                          # Other simulation components
```

## 3. Library Implementation Strategy

### 3.1. Step 1: Create the Library Structure

Create the new directory structure and set up the package.json for the library.

### 3.2. Step 2: Move Core Simulation Logic

1. Move relevant files from `src/simulation/core` to `lib/core`
2. Update imports and exports to ensure proper module structure
3. Remove any UI dependencies from the core code
4. Update types to be more generic and framework-agnostic

### 3.3. Step 3: Move Models, Analysis, and Adapters

1. Move diffusion models, solvers, and weight functions from `src/simulation/models` to `lib/models`
2. Move analysis tools from `src/simulation/analysis` to `lib/analysis`
3. Create adapter interfaces and implementations in `lib/adapters`
4. Ensure all components work with the core interfaces

### 3.4. Step 4: Create Entry Points

1. Create main entry points for each module (`index.ts`)
2. Implement a comprehensive main library entry point
3. Define a clear public API for the library

### 3.5. Step 5: Refactor Original Code to Use Library

1. Update imports in the original source code to use the new library
2. Remove duplicate code
3. Adapt UI components to interface with the library API

## 4. Library API Design

### 4.1. Main Entry Point (`lib/index.ts`)

```typescript
// Core exports
export * from './core';

// Models
export * from './models';

// Analysis tools
export * from './analysis';

// Adapters (optional, for visualization)
export * from './adapters';

// Utilities
export * from './utils';

// Factory functions for easy instantiation
export function createSimulationEngine(): SimulationEngine;
export function createGraph(): SimulationGraph;
export function createStateVector(nodeIds: string[]): StateVector;
```

### 4.2. Core Module API (`lib/core/index.ts`)

```typescript
// Types
export * from './types';

// Implementations
export { SpinNetworkGraph } from './graph';
export { SimulationStateVector } from './stateVector';
export { MathAdapter } from './mathAdapter';
export { SpinNetworkSimulationEngineImpl as SpinNetworkSimulationEngine } from './engineImplementation';
export { SimulationHistoryImpl } from './engineImplementation';
```

### 4.3. Models Module API (`lib/models/index.ts`)

```typescript
// Diffusion models
export { 
  OrdinaryDiffusionModel, 
  TelegraphDiffusionModel,
  DiffusionModelFactory 
} from './diffusionModels';

// Weight functions
export { 
  SpinWeightFunctionFactory, 
  createIntertwinerWeightFunction 
} from './weightFunctions';

// Numerical solvers
export {
  EulerSolver,
  MidpointSolver,
  RungeKutta4Solver,
  AdaptiveRKF45Solver,
  SolverFactory
} from './solvers';
```

## 5. Usage Examples

### 5.1. Basic Usage Example

```typescript
import { 
  createSimulationEngine, 
  createGraph, 
  createStateVector 
} from 'spin-network-lib';

// Create a simulation engine
const engine = createSimulationEngine();

// Create a graph (either programmatically or from existing data)
const graph = createGraph();
graph.addNode({
  id: 'node1',
  intertwiner: 2,
  position: { x: 0, y: 0 },
  properties: {}
});
// Add more nodes and edges...

// Initialize the simulation
engine.initialize(graph, {
  timeStep: 0.01,
  totalTime: 10,
  diffusionType: 'ordinary',
  alpha: 1.0,
  numericalMethod: 'rk4',
  weightFunction: 'spin',
  initialStateType: 'delta',
  initialStateParams: {
    nodeId: 'node1',
    value: 1.0
  },
  recordHistory: true,
  historyInterval: 10,
  parameters: {}
});

// Run the simulation
engine.runSteps(100);

// Get the results
const finalState = engine.getCurrentState();
const history = engine.getHistory();
```

### 5.2. Advanced Usage with Analysis

```typescript
import { 
  createSimulationEngine,
  SimulationAnalyzer,
  SpinNetworkGeometryCalculator 
} from 'spin-network-lib';

// ... setup engine and graph as before

// Run simulation
engine.runUntil(5.0);

// Analyze results
const analyzer = new SimulationAnalyzer();
const statistics = analyzer.analyzeTimeSeries(engine.getHistory());

// Calculate geometric properties
const geometryCalculator = new SpinNetworkGeometryCalculator();
const volume = geometryCalculator.calculateTotalVolume(engine.getCurrentState());
const dimension = geometryCalculator.calculateEffectiveDimension(
  graph, 
  engine.getCurrentState()
);

console.log('Simulation statistics:', statistics);
console.log('Geometric properties:', { volume, dimension });
```

## 6. Package Configuration (`lib/package.json`)

```json
{
  "name": "spin-network-lib",
  "version": "0.1.0",
  "description": "Library for simulating diffusion processes on spin networks",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "test": "jest"
  },
  "dependencies": {
    "mathjs": "^12.1.0",
    "lodash": "4.17.21"
  },
  "peerDependencies": {
    "cytoscape": "^3.26.0"
  },
  "peerDependenciesMeta": {
    "cytoscape": {
      "optional": true
    }
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

## 7. Implementation Timeline

1. **Phase 1 (Days 1-2)**: Set up directory structure and package configuration
2. **Phase 2 (Days 3-5)**: Move core simulation logic with updated interfaces
3. **Phase 3 (Days 6-8)**: Move and refactor models and analysis tools
4. **Phase 4 (Days 9-10)**: Set up proper entry points and API
5. **Phase 5 (Days 11-12)**: Add documentation and usage examples
6. **Phase 6 (Days 13-14)**: Test library and fix any issues
7. **Phase 7 (Days 15-16)**: Refactor original app to use the new library

## 8. Documentation Strategy

1. Create a README.md for the library with:
   - Installation instructions
   - Basic usage examples
   - API documentation
   - Advanced features

2. Add JSDoc comments to all public API functions

3. Create specific guides for:
   - Creating custom diffusion models
   - Implementing custom solvers
   - Extending the library with new features

## 9. Architectural Considerations

1. **Minimal Dependencies**: Limit the core library dependencies to essential math and utility libraries
2. **Optional Visualization**: Keep visualization adapters separate and optional
3. **Clean Interfaces**: Define clear interfaces between components
4. **Type Safety**: Maintain comprehensive TypeScript types for the entire library
5. **Error Handling**: Implement robust error handling and validation
6. **Performance**: Optimize critical code paths for performance
7. **Extensibility**: Design for easy extension with custom models and solvers

## 10. Technical Challenges to Address

1. **State Management**: Ensure state is properly managed without Redux dependencies
2. **Visualization Decoupling**: Separate visualization logic from core simulation
3. **Event Handling**: Implement an event system that works independently of React
4. **Type Compatibility**: Maintain type compatibility with the existing app
5. **Math Dependencies**: Ensure proper handling of mathematical operations without UI-specific code

## 11. Testing Strategy

1. **Unit Tests**: Create unit tests for all core components
2. **Integration Tests**: Test interactions between components
3. **API Tests**: Verify the public API behaves as expected
4. **Compatibility Tests**: Ensure the library works with the existing app
5. **Performance Tests**: Benchmark critical operations

## 12. Migration Path

1. **Parallel Implementation**: Keep the existing code working while developing the library
2. **Gradual Adoption**: Replace components one by one with library equivalents
3. **Backward Compatibility**: Ensure all existing features continue to work
4. **Documentation**: Document changes required in the main app to use the library

## 13. Future Expansion

Once the core library is implemented, consider these future enhancements:

1. **Additional Diffusion Models**: Support for more advanced diffusion models
2. **Extended Solvers**: More numerical solvers with specialized capabilities
3. **3D Support**: Enhanced support for 3D spin networks
4. **Web Worker Support**: Run simulations in a separate thread
5. **Serialization**: Improved import/export capabilities
6. **Interoperability**: Tools for interacting with other scientific libraries
