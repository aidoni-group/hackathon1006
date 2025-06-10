#!/bin/bash

echo "🧠 Starting Therapy Great Again Backend Server..."
echo "==========================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Navigate to MCP directory
cd "$(dirname "$0")/mcp" || {
    echo "❌ Could not find MCP directory"
    exit 1
}

echo "📁 Working directory: $(pwd)"

# Install dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating one..."
    echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
    echo "📝 Created .env file. Please add your OpenAI API key to: $(pwd)/.env"
    echo "💡 The server will work with fallback responses even without OpenAI API key."
fi

echo ""
echo "🚀 Starting MCP Therapy Server on http://localhost:3000"
echo "📋 Features available:"
echo "   • 5 AI Therapist Personalities (Trump, Greta, Oprah, Yoda, Professional)"
echo "   • Session Management"
echo "   • Conversation History"
echo "   • OpenAI GPT-3.5 Integration"
echo ""
echo "🎯 Frontend will connect to this server automatically"
echo "⭐ You can also use the interactive CLI by running: ./run_cli.sh"
echo ""

# Start the server
python3 main.py 