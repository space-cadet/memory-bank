# Spin Network Visualization and Diffusion App - Project Brief

## Project Overview

The Spin Network Visualization and Diffusion App is a web application that allows users to construct, visualize, and simulate diffusion processes on spin networks. It serves as an educational and research tool for exploring quantum geometric concepts through an interactive interface.

## Core Requirements

1. **Network Construction and Manipulation**
   - Create spin networks from scratch or templates
   - Edit network nodes (intertwiners) and edges (spins)
   - Support for various network symmetries (lattice, circular, random)

2. **Visualization Capabilities**
   - Interactive network visualization with zoom/pan controls
   - Visual representation of spins and intertwiners
   - Energy conservation plots and statistics

3. **Diffusion Simulation**
   - Ordinary diffusion (heat equation on graphs)
   - Finite velocity diffusion (telegraph equation)
   - Support for potential-based variants
   - Real-time visualization of propagation

4. **User Interface**
   - Intuitive, responsive design with resizable panels
   - Tool panels for network creation and editing
   - Properties panel for detailed element configuration
   - Simulation controls for running and analyzing diffusion

## Technology Stack

- **Frontend**: React with TypeScript
- **Visualization**: Cytoscape.js for networks, D3.js for plots
- **Mathematics**: math.js, numeric.js for calculations
- **State Management**: Redux
- **Build System**: Vite
- **Package Manager**: pnpm

## Project Goals

1. Create an educational tool for exploring spin networks and diffusion processes
2. Provide an intuitive interface for constructing and manipulating networks
3. Visualize complex mathematical processes in a comprehensible way
4. Enable researchers to experiment with different network configurations and diffusion parameters

## Development Phases

1. **Phase 1 (Current)**: Core UI implementation
   - Basic application layout with resizable panels
   - Network visualization component
   - Tool panels for network manipulation
   - Simple property editing

2. **Phase 2 (Upcoming)**: Basic Functionality
   - Network construction logic
   - Saving/loading networks
   - Diffusion algorithm implementation
   - Basic simulation capabilities

3. **Phase 3 (Future)**: Advanced Features
   - Enhanced visualization options
   - More sophisticated diffusion models
   - Advanced analysis tools
   - Performance optimizations
