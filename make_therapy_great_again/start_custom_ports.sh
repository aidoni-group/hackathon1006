#!/bin/bash

# Default ports
DEFAULT_BACKEND_PORT=3000
DEFAULT_FRONTEND_PORT=3001

# Parse command line arguments
BACKEND_PORT=${1:-$DEFAULT_BACKEND_PORT}
FRONTEND_PORT=${2:-$DEFAULT_FRONTEND_PORT}

# Display usage if help is requested
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    echo "🧠 Therapy Great Again - Custom Port Startup"
    echo "==========================================="
    echo ""
    echo "Usage: $0 [BACKEND_PORT] [FRONTEND_PORT]"
    echo ""
    echo "Arguments:"
    echo "  BACKEND_PORT   Port for Python MCP server (default: $DEFAULT_BACKEND_PORT)"
    echo "  FRONTEND_PORT  Port for NextJS frontend (default: $DEFAULT_FRONTEND_PORT)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Use default ports ($DEFAULT_BACKEND_PORT and $DEFAULT_FRONTEND_PORT)"
    echo "  $0 8000 8001          # Backend on 8000, Frontend on 8001"
    echo "  $0 5000               # Backend on 5000, Frontend on $DEFAULT_FRONTEND_PORT"
    echo ""
    echo "Services:"
    echo "  🐍 Backend:  RESTful API server with AI therapist personalities"
    echo "  ⚛️  Frontend: React/NextJS web application with speech interface"
    echo ""
    exit 0
fi

echo "🧠 Starting Therapy Great Again with Custom Ports"
echo "==============================================="
echo ""
echo "📋 Port Configuration:"
echo "   🐍 Backend (Python MCP): http://localhost:$BACKEND_PORT"
echo "   ⚛️  Frontend (NextJS): http://localhost:$FRONTEND_PORT"
echo ""

# Validate ports
if ! [[ "$BACKEND_PORT" =~ ^[0-9]+$ ]] || [ "$BACKEND_PORT" -lt 1024 ] || [ "$BACKEND_PORT" -gt 65535 ]; then
    echo "❌ Invalid backend port: $BACKEND_PORT (must be 1024-65535)"
    exit 1
fi

if ! [[ "$FRONTEND_PORT" =~ ^[0-9]+$ ]] || [ "$FRONTEND_PORT" -lt 1024 ] || [ "$FRONTEND_PORT" -gt 65535 ]; then
    echo "❌ Invalid frontend port: $FRONTEND_PORT (must be 1024-65535)"
    exit 1
fi

if [ "$BACKEND_PORT" -eq "$FRONTEND_PORT" ]; then
    echo "❌ Backend and frontend cannot use the same port"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    echo "🔄 Checking port $port..."
    if check_port $port; then
        echo "⚠️  Port $port is in use. Killing existing processes..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Check for required tools
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Clean up any existing processes on our ports
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# Create log directory
mkdir -p logs

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🧹 Shutting down services..."
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "🚀 Starting services on custom ports..."

# Start Backend Server
echo "1. 🐍 Starting Python MCP Backend Server on port $BACKEND_PORT..."
cd "$(dirname "$0")/mcp" || {
    echo "❌ Could not find MCP directory"
    exit 1
}

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt > ../logs/backend-install.log 2>&1

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one..."
    echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
    echo "📝 Created .env file. Add your OpenAI API key to: $(pwd)/.env"
    echo "💡 The server will work with fallback responses even without OpenAI API key."
fi

# Start backend in background
echo "🔧 Starting MCP server..."
PORT=$BACKEND_PORT python3 main.py > ../logs/backend-$BACKEND_PORT.log 2>&1 &
BACKEND_PID=$!
echo "📋 Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
        echo "✅ Backend server is running on port $BACKEND_PORT"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start. Check logs/backend-$BACKEND_PORT.log"
        cleanup
        exit 1
    fi
    sleep 1
done

# Start Frontend
echo ""
echo "2. ⚛️  Starting NextJS Frontend on port $FRONTEND_PORT..."
cd "$(dirname "$0")/nextjs-mui-app" || {
    echo "❌ Could not find NextJS directory"
    cleanup
    exit 1
}

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install > ../logs/frontend-install.log 2>&1

# Update SpeechInterface.tsx to use custom backend port
echo "🔧 Configuring frontend to connect to backend on port $BACKEND_PORT..."
sed -i.bak "s/const API_BASE_URL = 'http:\/\/localhost:[0-9]*'/const API_BASE_URL = 'http:\/\/localhost:$BACKEND_PORT'/" src/components/SpeechInterface.tsx

# Create or update next.config.js to use specific port
cat > next.config.js << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure app runs on port $FRONTEND_PORT
  experimental: {
    appDir: true,
  },
  // Enable CORS for backend communication
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:$BACKEND_PORT/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
EOF

# Update package.json to use specific port
if command -v jq &> /dev/null; then
    # Use jq if available
    jq '.scripts.dev = "next dev -p '$FRONTEND_PORT'"' package.json > package.json.tmp && mv package.json.tmp package.json
else
    # Fallback: simple sed replacement
    sed -i.bak2 's/"dev": "next dev[^"]*"/"dev": "next dev -p '$FRONTEND_PORT'"/' package.json
fi

# Start frontend in background
echo "🔧 Starting NextJS..."
PORT=$FRONTEND_PORT npm run dev > ../logs/frontend-$FRONTEND_PORT.log 2>&1 &
FRONTEND_PID=$!
echo "📋 Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
for i in {1..60}; do
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        echo "✅ Frontend server is running on port $FRONTEND_PORT"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ Frontend failed to start. Check logs/frontend-$FRONTEND_PORT.log"
        cleanup
        exit 1
    fi
    sleep 1
done

echo ""
echo "🎉 Both services are running successfully on custom ports!"
echo ""
echo "📱 Access your app:"
echo "   🌐 Frontend: http://localhost:$FRONTEND_PORT"
echo "   🔌 Backend API: http://localhost:$BACKEND_PORT"
echo "   🎭 Interactive CLI: cd mcp && ./run_cli.sh"
echo ""
echo "📊 Service Status:"
echo "   🐍 Backend: PID $BACKEND_PID (port $BACKEND_PORT)"
echo "   ⚛️  Frontend: PID $FRONTEND_PID (port $FRONTEND_PORT)"
echo ""
echo "📋 Features Available:"
echo "   • 5 AI Therapist Personalities"
echo "   • Speech Recognition & Text-to-Speech"
echo "   • Session Management & History"
echo "   • Real-time Therapy Conversations"
echo ""
echo "📝 Logs:"
echo "   • Backend: logs/backend-$BACKEND_PORT.log"
echo "   • Frontend: logs/frontend-$FRONTEND_PORT.log"
echo ""
echo "💡 Tips:"
echo "   • Works best in Chrome/Edge browsers"
echo "   • Allow microphone permissions for speech"
echo "   • Press Ctrl+C to stop both services"
echo ""
echo "🎯 Ready for therapy! Open http://localhost:$FRONTEND_PORT in your browser"

# Keep script running and monitor processes
echo "🔄 Monitoring services... (Press Ctrl+C to stop)"
while true; do
    # Check if processes are still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "❌ Backend process died. Check logs/backend-$BACKEND_PORT.log"
        cleanup
        exit 1
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "❌ Frontend process died. Check logs/frontend-$FRONTEND_PORT.log"
        cleanup
        exit 1
    fi
    
    sleep 5
done 