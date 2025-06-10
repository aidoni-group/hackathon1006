#!/bin/bash

echo "🧪 Testing Therapy Great Again Integration"
echo "========================================"

# Check if backend is running
echo "1. 🔍 Checking if backend server is running..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend server is running on localhost:3000"
else
    echo "❌ Backend server is not running. Please start it with: ./start_backend.sh"
    exit 1
fi

echo ""
echo "2. 🎭 Testing personalities endpoint..."
personalities=$(curl -s http://localhost:3000/personalities)
if [[ $personalities == *"trump"* ]]; then
    echo "✅ Personalities endpoint working - found AI therapists"
else
    echo "❌ Personalities endpoint failed"
    exit 1
fi

echo ""
echo "3. 🏛️ Testing session creation..."
session_response=$(curl -s -X POST http://localhost:3000/sessions/new \
    -H "Content-Type: application/json" \
    -d '{"personality": "trump"}')

if [[ $session_response == *"session_id"* ]]; then
    echo "✅ Session creation successful"
    session_id=$(echo $session_response | grep -o '"session_id":"[^"]*"' | cut -d'"' -f4)
    echo "📋 Session ID: ${session_id:0:8}..."
else
    echo "❌ Session creation failed"
    exit 1
fi

echo ""
echo "4. 💬 Testing therapy conversation..."
conversation_response=$(curl -s -X POST http://localhost:3000/call \
    -H "Content-Type: application/json" \
    -d "{\"inputs\": {\"session_id\": \"$session_id\", \"message\": \"Hello, I need some therapy advice\"}}")

if [[ $conversation_response == *"output"* ]]; then
    echo "✅ Therapy conversation successful"
    echo "🤖 AI Response preview: $(echo $conversation_response | grep -o '"output":"[^"]*"' | cut -d'"' -f4 | cut -c1-50)..."
else
    echo "❌ Therapy conversation failed"
    exit 1
fi

echo ""
echo "5. 📊 Testing session list..."
sessions_response=$(curl -s http://localhost:3000/sessions)
if [[ $sessions_response == *"total_sessions"* ]]; then
    echo "✅ Session listing successful"
else
    echo "❌ Session listing failed"
    exit 1
fi

echo ""
echo "6. 🧹 Cleaning up test session..."
delete_response=$(curl -s -X DELETE http://localhost:3000/sessions/$session_id)
if [[ $delete_response == *"deleted"* ]]; then
    echo "✅ Session cleanup successful"
else
    echo "⚠️  Session cleanup failed (not critical)"
fi

echo ""
echo "🎉 All integration tests passed!"
echo ""
echo "Next steps:"
echo "1. 🚀 Start frontend: cd nextjs-mui-app && npm run dev"
echo "2. 🌐 Open browser: http://localhost:3001"
echo "3. 🎭 Select an AI therapist and start talking!"
echo ""
echo "💡 Tips:"
echo "   • Works best in Chrome/Edge browsers"
echo "   • Allow microphone permissions for speech recognition"
echo "   • You can type or speak your messages"
echo "   • Try different AI personalities for variety" 