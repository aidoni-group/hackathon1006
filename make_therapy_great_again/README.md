# 🧠 Therapy Great Again - Full Stack AI Therapy Application

A complete AI therapy application featuring a beautiful React/NextJS frontend with speech recognition and a powerful Python MCP backend with multiple AI therapist personalities.

![AI Therapy Demo](https://img.shields.io/badge/Status-Ready_for_Therapy-green) ![Frontend](https://img.shields.io/badge/Frontend-NextJS%20%2B%20Material%20UI-blue) ![Backend](https://img.shields.io/badge/Backend-Python%20MCP%20Server-orange)

## ✨ Features

### 🎭 **5 AI Therapist Personalities**
- **Donald Trump** - Overconfident, satirical therapy with Trump-isms
- **Greta Thunberg** - Passionate, direct environmental-conscious guidance  
- **Oprah Winfrey** - Warm, encouraging, inspirational support
- **Yoda** - Wise Jedi insights about emotions and inner peace
- **Professional Therapist** - Traditional, compassionate therapy

### 🎤 **Advanced Speech Interface**
- Real-time speech recognition (Chrome/Edge)
- Text-to-speech AI responses with character voices
- Manual text input option
- Visual feedback during listening/speaking

### 💾 **Session Management**
- Persistent therapy sessions with conversation history
- Switch between different AI therapists
- View and manage multiple active sessions
- Delete old sessions when done

### 🤖 **AI Integration**
- OpenAI GPT-3.5 integration for intelligent responses
- Character-specific prompts and personality traits
- Fallback responses when OpenAI is unavailable
- Context-aware conversation continuity

### 🎨 **Beautiful UI/UX**
- Modern Material-UI design
- Responsive layout for all devices
- Real-time visual indicators
- Character avatars with jaw animation ready

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
# Make script executable and run
chmod +x start_backend.sh
./start_backend.sh
```

This will:
- Install Python dependencies
- Create `.env` file for OpenAI API key
- Start the MCP server on `http://localhost:3000`

### 2. Start the Frontend

```bash
cd nextjs-mui-app
npm install
npm run dev
```

The frontend will be available at `http://localhost:3001`

### 3. Optional: Add OpenAI API Key

```bash
# Edit the .env file in the mcp directory
echo "OPENAI_API_KEY=your-actual-api-key-here" > mcp/.env
```

**Note:** The app works with fallback responses even without an API key!

## 📁 Project Structure

```
make_therapy_great_again/
├── nextjs-mui-app/          # React/NextJS Frontend
│   ├── src/
│   │   ├── app/page.tsx     # Main application page
│   │   └── components/
│   │       ├── CharacterSelector.tsx    # AI therapist selection
│   │       ├── CharacterAvatar.tsx      # Character avatars
│   │       └── SpeechInterface.tsx      # Speech & conversation
│   └── public/assets/       # Character images for avatars
├── mcp/                     # Python MCP Backend
│   ├── main.py             # Main server with personalities
│   ├── therapy_cli.py      # Interactive terminal client
│   ├── requirements.txt    # Python dependencies
│   └── run_cli.sh         # Terminal interface launcher
├── start_backend.sh        # Quick backend startup script
└── README.md              # This file
```

## 🔌 API Integration

The frontend automatically connects to the backend using these endpoints:

### **Session Management**
```javascript
// Create new therapy session
POST /sessions/new
{ "personality": "trump" }

// List active sessions  
GET /sessions

// Get conversation history
GET /sessions/{sessionId}/history

// Delete session
DELETE /sessions/{sessionId}
```

### **Therapy Conversations**
```javascript
// Send message to AI therapist
POST /call
{
  "inputs": {
    "session_id": "uuid-here",
    "message": "I'm feeling stressed"
  }
}
```

### **Available Personalities**
```javascript
// Get all AI therapist personalities
GET /personalities
```

## 🎯 Usage Flow

1. **Select Therapist** - Choose from 5 AI personalities
2. **Start Session** - Automatic session creation with personalized greeting
3. **Therapy Conversation** - Speak or type your thoughts
4. **AI Response** - Get character-specific therapeutic guidance
5. **Continue/Switch** - Keep talking or switch to different therapist

## 🎤 Speech Features

- **Speech Recognition**: Uses Web Speech API (Chrome/Edge recommended)
- **Text-to-Speech**: AI responses spoken aloud with character voices
- **Visual Feedback**: Microphone and speaker indicators
- **Fallback Input**: Manual text input when speech isn't available

## 🛠️ Advanced Usage

### Interactive Terminal Client
```bash
cd mcp
./run_cli.sh
```

Features a beautiful terminal interface with:
- Live therapy conversations
- Session management
- Server monitoring
- Rich formatting and tables

### Testing the Backend
```bash
cd mcp
python test_enhanced_server.py
```

Runs comprehensive tests of all API endpoints and features.

## 🎨 Character Avatar System

The app is designed to work with realistic character avatars:
- `head1-{characterId}.jpg` - Closed mouth images
- `head2-{characterId}.jpg` - Open mouth images  
- Automatic jaw animation during speech synthesis
- Ready for advanced facial animation

## 📋 Dependencies

### Frontend
- Next.js 14
- Material-UI (MUI)
- TypeScript
- Web Speech API

### Backend  
- Flask (Python web server)
- OpenAI API (GPT-3.5)
- Rich (beautiful terminal UI)
- Questionary (interactive prompts)

## 🤝 Contributing

1. Add new AI personalities in `mcp/main.py`
2. Enhance speech features in `SpeechInterface.tsx`
3. Improve UI/UX in the React components
4. Add new therapy session features

## 📄 License

Open source - feel free to use for therapy, entertainment, or educational purposes!

---

**Ready to make therapy great again?** 🧠✨

Start the backend, launch the frontend, and begin your AI therapy journey! 