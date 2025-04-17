/**
 * Event System Implementation
 * 
 * This is a lightweight event emitter for the simulation library core
 */
export class EventEmitter {
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Add an event listener
   * @param event Event name
   * @param callback Function to call when event is emitted
   */
  addEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Remove an event listener
   * @param event Event name
   * @param callback Function to remove
   */
  removeEventListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)!.delete(callback);
  }

  /**
   * Emit an event
   * @param event Event name
   * @param data Event data
   */
  protected emit(event: string, data?: any): void {
    if (!this.listeners.has(event)) return;
    
    for (const callback of this.listeners.get(event)!) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    }
  }

  /**
   * Clear all listeners
   */
  clearListeners(): void {
    this.listeners.clear();
  }
}

/**
 * Enhanced SimulationEngine with event emission
 */
export class SpinNetworkSimulationEngine extends EventEmitter implements SimulationEngine {
  // Existing implementation...
  
  /**
   * Save simulation state to JSON
   * @returns Serialized simulation state
   */
  saveState(): Record<string, any> {
    return {
      graph: this._graph?.toJSON(),
      parameters: this._parameters,
      currentTime: this._currentTime,
      currentState: this._currentState?.toJSON(),
      history: this._history.toJSON()
    };
  }

  /**
   * Load simulation state from JSON
   * @param state Serialized simulation state
   */
  loadState(state: Record<string, any>): void {
    if (state.parameters) {
      this._parameters = state.parameters;
    }
    
    if (state.graph && this._graph) {
      this._graph = this._graph.fromJSON(state.graph);
    }
    
    if (state.currentTime !== undefined) {
      this._currentTime = state.currentTime;
    }
    
    // Additional loading logic...
    
    // Emit events
    this.emit(SimulationEvent.STATE_CHANGED);
  }
  
  // Override other methods to emit events
  step(): void {
    // Existing implementation...
    super.step();
    
    // Emit event after step
    this.emit(SimulationEvent.STEP_COMPLETE, {
      time: this._currentTime,
      state: this._currentState
    });
  }
  
  // Other overrides...
}

/**
 * State Management Adapter Interface
 * 
 * This interface defines how external state management systems
 * should interact with the simulation library
 */
export interface StateManagementAdapter {
  /**
   * Connect to the simulation engine
   * @param engine Simulation engine to connect to
   */
  connect(engine: SimulationEngine): void;
  
  /**
   * Disconnect from the simulation engine
   */
  disconnect(): void;
  
  /**
   * Apply external state to the simulation
   * @param state External state to apply
   */
  applyState(state: any): void;
  
  /**
   * Get current state from the simulation
   * @returns Current simulation state
   */
  getState(): any;
}

/**
 * React/Redux Adapter Implementation
 * 
 * This adapter connects the simulation library to a Redux store
 * WITHOUT creating direct dependencies on Redux in the library
 */
// This would live in the React app, not in the library
export class ReduxAdapter implements StateManagementAdapter {
  private engine: SimulationEngine | null = null;
  private dispatch: Function;
  private getReduxState: Function;
  private eventHandlers: Map<string, Function> = new Map();
  
  /**
   * Create a new Redux adapter
   * @param dispatch Redux dispatch function
   * @param getState Redux getState function
   */
  constructor(dispatch: Function, getState: Function) {
    this.dispatch = dispatch;
    this.getReduxState = getState;
  }
  
  /**
   * Connect to a simulation engine
   * @param engine Engine to connect to
   */
  connect(engine: SimulationEngine): void {
    this.engine = engine;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initial state sync
    this.syncStateToRedux();
  }
  
  /**
   * Disconnect from the simulation engine
   */
  disconnect(): void {
    if (!this.engine) return;
    
    // Remove all event listeners
    for (const [event, handler] of this.eventHandlers.entries()) {
      this.engine.removeEventListener(event, handler);
    }
    
    this.eventHandlers.clear();
    this.engine = null;
  }
  
  /**
   * Set up event listeners for the simulation engine
   */
  private setupEventListeners(): void {
    if (!this.engine) return;
    
    // Step complete handler
    const handleStepComplete = (data: any) => {
      this.dispatch({
        type: 'simulation/setCurrentTime',
        payload: data.time
      });
      
      // Update other state as needed
      this.syncStateToRedux();
    };
    
    // Simulation paused handler
    const handlePaused = () => {
      this.dispatch({
        type: 'simulation/setSimulationRunning',
        payload: false
      });
    };
    
    // Simulation resumed handler
    const handleResumed = () => {
      this.dispatch({
        type: 'simulation/setSimulationRunning',
        payload: true
      });
    };
    
    // Add event listeners
    this.engine.addEventListener('step-complete', handleStepComplete);
    this.engine.addEventListener('simulation-paused', handlePaused);
    this.engine.addEventListener('simulation-resumed', handleResumed);
    
    // Store handlers for later removal
    this.eventHandlers.set('step-complete', handleStepComplete);
    this.eventHandlers.set('simulation-paused', handlePaused);
    this.eventHandlers.set('simulation-resumed', handleResumed);
  }
  
  /**
   * Sync simulation state to Redux
   */
  private syncStateToRedux(): void {
    if (!this.engine) return;
    
    // Get current state from engine
    const currentState = this.engine.getCurrentState();
    const currentTime = this.engine.getCurrentTime();
    const history = this.engine.getHistory();
    const running = this.engine.isRunning();
    const hasHistory = history.getTimes().length > 0;
    
    // Dispatch actions to update Redux state
    this.dispatch({
      type: 'simulation/updateState',
      payload: {
        currentTime,
        isRunning: running,
        hasHistory
        // Additional state properties...
      }
    });
    
    // Additional state synchronization as needed
  }
  
  /**
   * Apply Redux state to the simulation
   * @param state Redux state to apply
   */
  applyState(state: any): void {
    if (!this.engine) return;
    
    // Apply parameters from Redux to simulation
    if (state.parameters) {
      // Update simulation parameters
      // This would depend on your specific implementation
    }
    
    // Additional state application as needed
  }
  
  /**
   * Get current simulation state
   * @returns Current simulation state
   */
  getState(): any {
    if (!this.engine) return null;
    
    return {
      currentTime: this.engine.getCurrentTime(),
      isRunning: this.engine.isRunning(),
      // Additional state properties...
    };
  }
}

/**
 * Vanilla JS Adapter Implementation
 * 
 * This adapter is usable without any framework dependencies
 */
export class VanillaJSAdapter implements StateManagementAdapter {
  private engine: SimulationEngine | null = null;
  private stateListeners: Set<Function> = new Set();
  private eventHandlers: Map<string, Function> = new Map();
  
  /**
   * Connect to a simulation engine
   * @param engine Engine to connect to
   */
  connect(engine: SimulationEngine): void {
    this.engine = engine;
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  /**
   * Disconnect from the simulation engine
   */
  disconnect(): void {
    if (!this.engine) return;
    
    // Remove all event listeners
    for (const [event, handler] of this.eventHandlers.entries()) {
      this.engine.removeEventListener(event, handler);
    }
    
    this.eventHandlers.clear();
    this.engine = null;
  }
  
  /**
   * Set up event listeners for the simulation engine
   */
  private setupEventListeners(): void {
    if (!this.engine) return;
    
    // Generic state change handler
    const handleStateChange = () => {
      this.notifyListeners();
    };
    
    // Add event listeners for all relevant events
    const events = [
      'step-complete',
      'simulation-complete',
      'simulation-reset',
      'simulation-paused',
      'simulation-resumed',
      'state-changed',
      'state-normalized'
    ];
    
    for (const event of events) {
      this.engine.addEventListener(event, handleStateChange);
      this.eventHandlers.set(event, handleStateChange);
    }
  }
  
  /**
   * Notify all state listeners of changes
   */
  private notifyListeners(): void {
    if (!this.engine) return;
    
    const state = this.getState();
    
    for (const listener of this.stateListeners) {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    }
  }
  
  /**
   * Add a state change listener
   * @param listener Function to call when state changes
   */
  addStateListener(listener: Function): void {
    this.stateListeners.add(listener);
  }
  
  /**
   * Remove a state change listener
   * @param listener Function to remove
   */
  removeStateListener(listener: Function): void {
    this.stateListeners.delete(listener);
  }
  
  /**
   * Apply external state to the simulation
   * @param state External state to apply
   */
  applyState(state: any): void {
    if (!this.engine) return;
    
    // Apply state to simulation
    // Implementation would depend on your needs
  }
  
  /**
   * Get current simulation state
   * @returns Current simulation state
   */
  getState(): any {
    if (!this.engine) return null;
    
    return {
      currentTime: this.engine.getCurrentTime(),
      isRunning: this.engine.isRunning(),
      // Additional state as needed
    };
  }
}

/**
 * Example usage with React hooks
 */
/* 
// This would be in the React app's hooks folder
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSimulationEngine } from 'spin-network-lib';
import { ReduxAdapter } from './adapters/reduxAdapter';

export function useSimulation() {
  const dispatch = useDispatch();
  const simulationState = useSelector(state => state.simulation);
  
  // Refs to maintain instance identity
  const engineRef = useRef(null);
  const adapterRef = useRef(null);
  
  // Initialize engine and adapter
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = createSimulationEngine();
    }
    
    if (!adapterRef.current) {
      adapterRef.current = new ReduxAdapter(
        dispatch,
        () => simulationState
      );
      adapterRef.current.connect(engineRef.current);
    }
    
    // Cleanup on unmount
    return () => {
      if (adapterRef.current) {
        adapterRef.current.disconnect();
      }
    };
  }, [dispatch]);
  
  // Return a clean API that uses the adapter
  return {
    // Simulation methods
    startSimulation: () => {
      engineRef.current.resume();
    },
    pauseSimulation: () => {
      engineRef.current.pause();
    },
    resetSimulation: () => {
      engineRef.current.reset();
    },
    // ... other methods
    
    // State from Redux
    isRunning: simulationState.isRunning,
    currentTime: simulationState.currentTime,
    // ... other state properties
  };
}
*/

/**
 * Example Persistence Implementation
 */
export class SimulationPersistence {
  /**
   * Save simulation state to localStorage
   * @param key Storage key
   * @param engine Simulation engine to save
   */
  static saveToLocalStorage(key: string, engine: SimulationEngine): void {
    try {
      const state = (engine as any).saveState();
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving simulation to localStorage:', error);
    }
  }
  
  /**
   * Load simulation state from localStorage
   * @param key Storage key
   * @param engine Simulation engine to load into
   * @returns Whether loading was successful
   */
  static loadFromLocalStorage(key: string, engine: SimulationEngine): boolean {
    try {
      const stateJson = localStorage.getItem(key);
      if (!stateJson) return false;
      
      const state = JSON.parse(stateJson);
      (engine as any).loadState(state);
      return true;
    } catch (error) {
      console.error('Error loading simulation from localStorage:', error);
      return false;
    }
  }
  
  /**
   * Export simulation state to a file
   * @param engine Simulation engine to export
   * @param filename Filename to save as
   */
  static exportToFile(engine: SimulationEngine, filename: string): void {
    try {
      const state = (engine as any).saveState();
      const json = JSON.stringify(state, null, 2);
      
      // Create download link
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting simulation to file:', error);
    }
  }
  
  /**
   * Import simulation state from a file
   * @param engine Simulation engine to import into
   * @param file File object to import from
   * @returns Promise that resolves when import is complete
   */
  static importFromFile(engine: SimulationEngine, file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          const state = JSON.parse(json);
          
          (engine as any).loadState(state);
          resolve(true);
        } catch (error) {
          console.error('Error parsing simulation file:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }
}