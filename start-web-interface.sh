#!/bin/bash

# Memory Bank Web Interface - Startup Script
# Starts both backend and frontend servers

set -e

echo "Starting Memory Bank Web Interface..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Install dependencies if needed
echo "Checking dependencies..."

if [ ! -d "web-server/node_modules" ]; then
    echo "Installing web-server dependencies..."
    cd web-server
    npm install
    cd ..
fi

if [ ! -d "web-ui/node_modules" ]; then
    echo "Installing web-ui dependencies..."
    cd web-ui
    npm install
    cd ..
fi

echo ""
echo "Starting servers..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    wait $FRONTEND_PID 2>/dev/null || true
}

trap cleanup EXIT INT TERM

# Start backend server
echo "🚀 Starting backend on http://localhost:3001..."
cd web-server
npm run dev &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend server
echo "🚀 Starting frontend on http://localhost:3000..."
cd web-ui
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 2

echo ""
echo "✓ Memory Bank Web Interface is running!"
echo ""
echo "📖 Open your browser and navigate to:"
echo "   http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

wait
