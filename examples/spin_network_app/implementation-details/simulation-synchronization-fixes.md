# Simulation Engine Synchronization Fixes

*Created: April 11, 2025*

## Overview

We identified and fixed synchronization issues between the network model and simulation state vector, particularly when creating new networks from templates. The primary issue was that node IDs in the simulation parameters were not properly synchronized with the actual network nodes.

## Issues Fixed

1. **Node ID Synchronization**:
   - Fixed issue where node IDs in simulation parameters could reference nodes that no longer exist
   - Added validation to check if node IDs in parameters actually exist in the network
   - Added fallback to first node when specified node ID is invalid

2. **Race Conditions**:
   - Added timeouts to ensure state updates are fully propagated before critical operations
   - Improved the update sequence in useSimulation hook to prevent race conditions
   - Added more defensive checks to prevent accessing undefined state

3. **Error Handling**:
   - Added comprehensive try/catch blocks around critical simulation operations
   - Improved error messages for easier debugging
   - Added console logging for critical errors
   - Prevented cascading errors by adding early returns

## Implementation Details

### useSimulation Hook Improvements

1. **Network Change Handling**:
   - Improved the effect that responds to network changes
   - Added validation for node IDs when network changes
   - Implemented proper sequencing of updates with setTimeout

2. **Simulation Start Logic**:
   - Added validation before starting simulation
   - Deferred simulation start if parameters need updating
   - Added comprehensive error handling

3. **Reset Functionality**:
   - Added validation during simulation reset
   - Improved parameter updates during reset
   - Added timeouts to ensure proper state propagation

## Key Code Changes

1. **Network Change Handler**:
```typescript
useEffect(() => {
  // Only proceed if network exists and has nodes
  if (!network || !network.nodes || network.nodes.length === 0) {
    return;
  }
  
  try {
    // Create simulation graph from network
    graphRef.current = createSimulationGraph(network);
    
    // Update default node ID if it's not set or doesn't exist in network
    const nodeExists = network.nodes.some(node => 
      node.id === parameters.initialStateParams.nodeId);
    
    if (!nodeExists && network.nodes.length > 0) {
      // Update parameters with valid node ID
      setParameters(prev => ({
        ...prev,
        initialStateParams: {
          ...prev.initialStateParams,
          nodeId: network.nodes[0].id
        }
      }));
      
      // Delay initialization to ensure parameters are updated
      setTimeout(() => {
        if (engineRef.current && graphRef.current) {
          engineRef.current.initialize(graphRef.current, parameters);
        }
      }, 100);
    }
  } catch (error) {
    console.error("Error initializing simulation:", error);
  }
}, [network]);
```

2. **Simulation Start Logic**:
```typescript
// Validate that the nodeId exists in the network
let nodeIdIsValid = true;
if (network?.nodes?.length > 0) {
  const nodeExists = network.nodes.some(node => 
    node.id === parameters.initialStateParams.nodeId);
  
  if (!nodeExists) {
    nodeIdIsValid = false;
    
    // Update with first node ID
    const firstNodeId = network.nodes[0].id;
    setParameters(prev => ({
      ...prev,
      initialStateParams: {
        ...prev.initialStateParams,
        nodeId: firstNodeId
      }
    }));
    
    // Don't proceed with simulation start until parameters are updated
    setTimeout(() => {
      startSimulation();
    }, 50);
    return;
  }
}
```

## Lessons Learned

1. **State Synchronization**:
   - Always validate critical data before using it
   - Be cautious with race conditions in React's state updates
   - Use timeouts strategically to ensure proper state propagation

2. **Error Handling**:
   - Add comprehensive error handling around critical operations
   - Provide clear error messages for easier debugging
   - Prevent cascading errors with early returns

3. **Defensive Programming**:
   - Always check for null/undefined values
   - Provide fallbacks for invalid data
   - Use optional chaining and nullish coalescing for safer access

## Future Improvements

1. **State Management**:
   - Consider using more atomic state updates
   - Explore using immer for immutable state updates
   - Add more comprehensive validation for all parameters

2. **Error Recovery**:
   - Implement more graceful recovery mechanisms
   - Add user-friendly error messages
   - Provide automatic recovery options

3. **Testing**:
   - Add unit tests for edge cases
   - Implement integration tests for the complete simulation flow
   - Add stress tests with rapid network changesOperation timed out after 30 seconds