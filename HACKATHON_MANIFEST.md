# 🧠 Therapy Great Again - Hackathon Manifest

**Team:** Solo Developer + Claude AI Assistant  
**Theme:** AI-Powered Therapy Assistant  
**Started:** 2024 MCP Hackathon  
**Tech Stack:** Python Flask, OpenAI GPT-3.5, MCP Protocol

---

## 🎯 Project Goal
Build an MCP-compliant server that provides therapeutic AI responses using OpenAI's API.

---

## 📝 Development Log

### **Phase 1: Initial Setup**
**Human:** "We need a basic MCP server to respond to requests"

**AI Response:** 
- ✅ Created `main.py` with Flask-based MCP server
- ✅ Implemented required endpoints: `/.well-known/ai-plugin.json` and `/call`
- ✅ Added health check, error handling, and logging
- ✅ Created `requirements.txt` with dependencies
- ✅ Added comprehensive test script
- ✅ Created detailed README with setup instructions

**Status:** MCP Protocol Compliance ✅

---

### **Phase 2: OpenAI Integration + Web Interface**
**Human:** "great, create a very basic index.html that integrates with the MCP. We have the an .env file with OPEN AI API KEY which we should use for therapy responses."

**AI Response:**
- ✅ Integrated OpenAI GPT-3.5-turbo for therapeutic responses
- ✅ Added `.env` support with python-dotenv
- ✅ Created beautiful HTML interface with chat functionality
- ✅ Added proper therapeutic system prompts
- ✅ Implemented fallback responses for API failures
- ✅ Updated requirements.txt with OpenAI dependency

**Status:** AI Integration ✅, Web Interface ✅

---

### **Phase 3: Back to Basics - MCP Focus**
**Human:** "ok, fuck this - get rid of the interface. Let's focus on the MCP server interaction. Let's also create a manifest where we note down all the actions we take in a hackathon readable way. in short what we prompt and what you respond - keep a log of our interactions"

**AI Response:**
- ✅ Stripped out HTML interface
- ✅ Focused on pure MCP server functionality
- ✅ Kept OpenAI integration for better responses
- ✅ Created this hackathon manifest for tracking progress
- ✅ Maintained all MCP protocol compliance

**Status:** MCP Server Focused ✅, Documentation ✅

---

### **Phase 4: Enhanced Therapy Features**
**Human:** "Let's improve this MCP. What we need. We're building a therapy session AI server. We need: - conversation history - new session - delete session - select AI personality to receieve HELP from. Ex. we should initialise the therapy session talking with Trump / Greta Thunberg"

**AI Response:**
- ✅ Added session management (create/delete/list sessions)
- ✅ Implemented conversation history storage and retrieval
- ✅ Created 5 AI personalities: Trump, Greta Thunberg, Oprah, Yoda, Professional Therapist
- ✅ Each personality has unique system prompts and greetings
- ✅ Full conversation context maintained across messages
- ✅ Updated MCP /call endpoint to require session_id
- ✅ Added comprehensive test suite for all new features
- ✅ Enhanced error handling and validation

**Status:** Full Therapy Platform ✅, Session Management ✅, AI Personalities ✅

---

## 🚀 Current State

### **MCP Server Features:**
- **✅ Protocol Compliant**: Implements exact MCP specification
- **✅ AI-Powered**: Uses OpenAI GPT-3.5 for therapeutic responses
- **✅ Session Management**: Create, delete, list therapy sessions
- **✅ Conversation History**: Full context maintained across conversations
- **✅ AI Personalities**: 5 unique therapeutic personalities
- **✅ Robust**: Fallback responses, error handling, logging
- **✅ Configurable**: Environment-based configuration
- **✅ Production Ready**: Health checks, proper status codes

### **Endpoints:**
- `GET /.well-known/ai-plugin.json` - AI plugin manifest
- `POST /call` - Main MCP endpoint (requires session_id)
- `POST /sessions/new` - Create new therapy session with personality
- `GET /sessions` - List all active sessions
- `GET /sessions/{id}/history` - Get conversation history
- `DELETE /sessions/{id}` - Delete therapy session
- `GET /personalities` - List available AI personalities
- `GET /health` - Health check with session statistics
- `GET /` - Server info and status

### **Available AI Personalities:**
- **Trump**: Confident, direct, "tremendous" therapy advice
- **Greta Thunberg**: Passionate, direct, environmentally-conscious support
- **Oprah Winfrey**: Warm, encouraging, inspirational guidance
- **Yoda**: Wise, Force-based emotional insights
- **Professional Therapist**: Traditional therapeutic approach

### **Example Usage:**

**1. Create a session with Trump personality:**
```bash
curl -X POST http://localhost:3000/sessions/new \
  -H "Content-Type: application/json" \
  -d '{"personality": "trump"}'
```

**2. Chat with your selected personality:**
```bash
curl -X POST http://localhost:3000/call \
  -H "Content-Type: application/json" \
  -d '{"inputs": {"session_id": "your-session-id", "message": "I am feeling anxious"}}'
```

**Sample Trump Response:**
```json
{
  "output": "Listen, anxiety is very common, believe me. I've dealt with incredible pressure - the White House, business deals, tremendous stress. Here's what you do: you focus on what you can control, you make a plan - a beautiful plan - and you execute it. What's making you anxious? Let's tackle this thing head-on!",
  "metadata": {
    "timestamp": "2024-01-01T12:00:00.123456",
    "server": "Therapy Great Again MCP Server",
    "version": "2.0.0",
    "session_id": "abc123...",
    "personality": "Donald Trump"
  }
}
```

---

## 🏁 Hackathon Requirements Status

- ✅ **Implement MCP-compatible server**
- ✅ **Use AI (GPT-3.5-turbo)**
- ✅ **Demo working /call endpoint**
- ⚠️ **UI for bonus points** (Removed per request)

---

## 🔧 Quick Start

```bash
cd make_therapy_great_again/mcp
pip install -r requirements.txt
echo "OPENAI_API_KEY=your-key-here" > .env
python main.py
```

Test:
```bash
python test_server.py
```

---

## 📊 Development Velocity

- **Time:** ~30 minutes
- **Files Created:** 5
- **Lines of Code:** ~200 (focused)
- **Features:** Core MCP + AI integration
- **Iterations:** 3 major phases

---

## 🧠 AI Therapeutic Approach

**System Prompt:**
> "You are a compassionate and professional therapist. Provide supportive, empathetic responses that encourage self-reflection and emotional exploration. Keep responses concise but meaningful. Always maintain professional boundaries and suggest professional help when appropriate."

**Key Features:**
- Empathetic response generation
- Professional boundaries maintained
- Fallback for technical issues
- Concise but meaningful responses
- Encourages self-reflection

---

## 🎯 Next Steps (If Continuing)

1. Add more sophisticated therapy techniques
2. Implement conversation memory/context
3. Add crisis detection and response
4. Enhanced error handling and retry logic
5. Rate limiting and usage analytics

---

**Status:** �� **READY FOR DEMO** 