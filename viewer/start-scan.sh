#!/bin/bash

# Approach 1: Generate static manifest and open viewer
# Usage: ./start-scan.sh
# Then open viewer.html in your browser (file://)

set -e

echo "🔍 Generating Memory Bank Manifest..."
echo ""
echo "This approach:"
echo "  ✅ Works offline (file:// protocol)"
echo "  ✅ Portable (just files, no process)"
echo "  ✅ No runtime dependencies needed"
echo "  ❌ Static snapshot (must re-run to see new files)"
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

# Generate manifest
echo "Scanning memory bank directory..."
node generate-manifest.js

if [ -f "manifest.json" ]; then
    echo ""
    echo "✅ Manifest generated successfully!"
    echo ""
    echo "📖 To view the memory bank:"
    echo ""

    # Try to open in default browser
    if command -v xdg-open &> /dev/null; then
        # Linux
        echo "   Opening viewer.html in default browser..."
        xdg-open "file://$SCRIPT_DIR/viewer.html" 2>/dev/null || true
    elif command -v open &> /dev/null; then
        # macOS
        echo "   Opening viewer.html in default browser..."
        open "file://$SCRIPT_DIR/viewer.html" 2>/dev/null || true
    else
        # Fallback
        echo "   Open this file in your browser:"
        echo "   file://$SCRIPT_DIR/viewer.html"
    fi
    echo ""
    echo "💡 To see new/changed files, run this script again: ./start-scan.sh"
else
    echo "❌ Failed to generate manifest"
    exit 1
fi
