# Therapy Great Again - MCP Server

A basic MCP (Model Context Protocol) server implementation for therapeutic AI interactions.

## Features

- ✅ MCP Protocol compliant
- ✅ Implements required endpoints (`/.well-known/ai-plugin.json` and `/call`)
- ✅ OpenAI GPT-3.5 integration for therapeutic responses
- ✅ Session management with conversation history
- ✅ 5 unique AI personalities (Trump, Greta, Oprah, Yoda, Professional)
- ✅ Beautiful interactive CLI interface
- ✅ Health check endpoint
- ✅ Comprehensive error handling
- ✅ Logging support
- ✅ Fallback responses when OpenAI is unavailable

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with your OpenAI API key:
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

3. Run the server:
```bash
python main.py
```

The server will start on `http://localhost:3000` by default.

4. **Use the Interactive CLI (Recommended):**
```bash
# In another terminal
./run_cli.sh
```

## Interactive CLI Features

The `therapy_cli.py` provides a beautiful terminal interface with:

- 🎭 **Personality Selection**: Choose from 5 unique AI therapists
- 💬 **Live Chat**: Real-time conversation with typing indicators
- 📋 **Session Management**: Create, list, and delete therapy sessions  
- 📜 **History Viewer**: View complete conversation history
- 🏥 **Server Status**: Monitor server health and statistics
- 🎨 **Beautiful UI**: Rich terminal interface with tables and panels

## Endpoints

### `/.well-known/ai-plugin.json` (GET)
Returns the AI plugin manifest with server metadata.

### `/call` (POST)
Main endpoint for processing requests.

**Request format:**
```json
{
  "inputs": {
    "message": "Your message here"
  }
}
```

**Response format:**
```json
{
  "output": "Server response",
  "metadata": {
    "timestamp": "2024-01-01T12:00:00",
    "server": "Therapy Great Again MCP Server",
    "version": "1.0.0"
  }
}
```

### `/health` (GET)
Health check endpoint.

### `/` (GET)
Root endpoint with server information.

## Testing

Run the test script:
```bash
python test_server.py
```

Or test manually with curl:
```bash
curl -X POST http://localhost:3000/call \
  -H "Content-Type: application/json" \
  -d '{"inputs": {"message": "Hello"}}'
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `DEBUG`: Enable debug mode (default: False)

## Example Usage

```bash
# Start the server
python main.py

# In another terminal, test it
curl -X POST http://localhost:3000/call \
  -H "Content-Type: application/json" \
  -d '{"inputs": {"message": "I am feeling stressed"}}'
```

Response:
```json
{
  "output": "I hear you saying: 'I am feeling stressed'. That sounds important. Can you tell me more about how that makes you feel?",
  "metadata": {
    "timestamp": "2024-01-01T12:00:00.123456",
    "server": "Therapy Great Again MCP Server",
    "version": "1.0.0"
  }
}
``` 