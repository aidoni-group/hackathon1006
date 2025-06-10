#!/bin/bash

echo "🧠 Therapy Great Again - Quick Start Menu"
echo "========================================"
echo ""
echo "Choose how you want to start the application:"
echo ""
echo "1. 🚀 Full App (Default Ports)"
echo "   Backend: localhost:3000, Frontend: localhost:3001"
echo "   Command: ./start_full_app.sh"
echo ""
echo "2. ⚙️  Custom Ports"
echo "   Specify your own ports for backend and frontend"
echo "   Command: ./start_custom_ports.sh [backend_port] [frontend_port]"
echo ""
echo "3. 🐍 Backend Only"
echo "   Start just the Python MCP server"
echo "   Command: ./start_backend.sh"
echo ""
echo "4. 🎭 Interactive CLI"
echo "   Terminal-based therapy interface"
echo "   Command: cd mcp && ./run_cli.sh"
echo ""
echo "5. 🧪 Test Integration"
echo "   Verify backend is working properly"
echo "   Command: ./test_integration.sh"
echo ""

read -p "Select an option (1-5): " choice

case $choice in
    1)
        echo "🚀 Starting full application with default ports..."
        ./start_full_app.sh
        ;;
    2)
        echo ""
        echo "⚙️  Custom Port Configuration"
        echo "Default backend port: 3000"
        echo "Default frontend port: 3001"
        echo ""
        read -p "Enter backend port (or press Enter for 3000): " backend_port
        read -p "Enter frontend port (or press Enter for 3001): " frontend_port
        
        backend_port=${backend_port:-3000}
        frontend_port=${frontend_port:-3001}
        
        echo "🚀 Starting with backend on $backend_port and frontend on $frontend_port..."
        ./start_custom_ports.sh $backend_port $frontend_port
        ;;
    3)
        echo "🐍 Starting backend server only..."
        ./start_backend.sh
        ;;
    4)
        echo "🎭 Starting interactive CLI..."
        cd mcp && ./run_cli.sh
        ;;
    5)
        echo "🧪 Testing integration..."
        ./test_integration.sh
        ;;
    *)
        echo "❌ Invalid option. Please run the script again and choose 1-5."
        exit 1
        ;;
esac 