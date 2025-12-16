#!/bin/bash

# Approach 2: Start the dynamic server for real-time file discovery
# Usage: ./start-server.sh
# Then open http://localhost:8000/viewer.html in your browser

set -e

echo "🚀 Starting Memory Bank Viewer Server..."
echo ""
echo "This approach:"
echo "  ✅ Real-time file discovery (always fresh)"
echo "  ✅ No build step needed"
echo "  ❌ Requires Node.js"
echo "  ❌ Must use http:// (not file://)"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Using Node.js $NODE_VERSION"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Start the server
echo "Starting server on http://localhost:8000..."
echo ""
echo "📖 Open in your browser: http://localhost:8000/viewer.html"
echo "📡 API endpoint: http://localhost:8000/api/files"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node server.js
