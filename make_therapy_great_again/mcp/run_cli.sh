#!/bin/bash

echo "🧠 Therapy Great Again - Interactive CLI"
echo "========================================"
echo

# Check if server is running
if ! curl -s http://localhost:3000/health > /dev/null; then
    echo "⚠️  MCP Server not detected on localhost:3000"
    echo "Please start the server first:"
    echo "  python main.py"
    echo
    read -p "Press Enter if server is running on different port, or Ctrl+C to exit..."
fi

# Run the CLI
python therapy_cli.py "$@" 