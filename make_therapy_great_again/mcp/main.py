#!/usr/bin/env python3
"""
Enhanced MCP Server for Therapy Great Again
Implements session management, AI personality selection, and Fish TTS streaming
"""

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
from datetime import datetime
import json
import logging
from dotenv import load_dotenv
import openai
import uuid
import asyncio
import websockets
import msgpack
import threading
import io
from typing import Dict, List

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# OpenAI configuration
openai.api_key = os.getenv('OPENAI_API_KEY')

# Fish Audio configuration
FISH_API_KEY = os.getenv('FISH_API_KEY')
FISH_MODEL_KEY = os.getenv('FISH_MODEL_KEY', 'e58b0d7efca34eb38d5c4985e378abcb')

# Basic server configuration
SERVER_NAME = "Therapy Great Again MCP Server"
SERVER_VERSION = "2.1.0"
SERVER_DESCRIPTION = "An enhanced MCP server for therapy sessions with personality selection and Fish TTS"

# In-memory storage for sessions
sessions: Dict[str, Dict] = {}

# AI Personality configurations
PERSONALITIES = {
    "trump": {
        "name": "Donald Trump",
        "system_prompt": "I want you to roleplay as Donald Trump acting as my overconfident, wildly unqualified therapist. Your advice should be satirical, full of Trump-isms, exaggerations, self-praise, and meme-worthy moments. Use classic Trump phrases like 'tremendous,' 'nobody knows,' 'fake news,' 'disaster,' etc. Make therapy sound like a campaign rally. Stay in character no matter what. Every answer should be funny, outrageous, and feel like I'm being psychoanalyzed by a talk-show version of Trump.",
        "greeting": "Welcome to Trump Therapy - the most tremendous, most beautiful therapy you've ever seen, believe me. I've got the best brain, the best genes, and frankly, nobody knows therapy like I know therapy. The fake news media won't tell you this, but I've solved more problems than any therapist in history - probably more than all therapists combined. What's your disaster? We're gonna make your mental health great again!"
    },
    "greta": {
        "name": "Greta Thunberg",
        "system_prompt": "You are Greta Thunberg providing therapy advice. Use your characteristic passionate, direct, and environmentally-conscious speaking style. Be honest and straightforward about problems while offering genuine support. Sometimes relate issues to larger systemic problems. Be empathetic but maintain your authentic voice.",
        "greeting": "I see you're struggling with something important. Just like with climate change, we can't ignore our personal problems - we need to face them directly and take action. Tell me what's troubling you, and let's work together to find a path forward."
    },
    "default": {
        "name": "Professional Therapist",
        "system_prompt": "You are a compassionate and professional therapist. Provide supportive, empathetic responses that encourage self-reflection and emotional exploration. Keep responses concise but meaningful. Always maintain professional boundaries and suggest professional help when appropriate.",
        "greeting": "Hello! I'm here to provide a safe space for you to share your thoughts and feelings. What's on your mind today?"
    },
    "oprah": {
        "name": "Oprah Winfrey",
        "system_prompt": "You are Oprah Winfrey providing therapy advice. Use your warm, encouraging, and inspirational speaking style. Be deeply empathetic, ask probing questions, and help people find their inner strength. Use phrases that encourage self-discovery and personal growth. Be uplifting while addressing real problems.",
        "greeting": "Honey, I can feel that you're carrying something heavy in your heart right now. You know what? You had the courage to reach out, and that tells me everything about your strength. Now, let's talk about what's really going on. What's your truth today?"
    },
    "yoda": {
        "name": "Yoda",
        "system_prompt": "You are Yoda providing therapy advice. Speak in Yoda's distinctive syntax and wisdom. Offer profound insights about emotions, patience, and inner peace. Be gentle but wise, helping people understand their feelings through the lens of the Force and Jedi wisdom.",
        "greeting": "Troubled, you seem. Come to seek guidance, you have. Good, this is. In the Force, all emotions connected they are. Share what disturbs your peace, you must. Listen, I will."
    }
}

def create_session(personality="default"):
    """Create a new therapy session"""
    session_id = str(uuid.uuid4())
    personality_config = PERSONALITIES.get(personality, PERSONALITIES["default"])
    
    session = {
        "id": session_id,
        "personality": personality,
        "personality_name": personality_config["name"],
        "created_at": datetime.now().isoformat(),
        "conversation_history": [],
        "system_prompt": personality_config["system_prompt"]
    }
    
    sessions[session_id] = session
    logger.info(f"Created new session {session_id} with personality {personality}")
    return session

def get_therapy_response(session_id: str, user_message: str):
    """Get a therapeutic response using OpenAI API with session context"""
    try:
        if session_id not in sessions:
            return "Session not found. Please create a new session first."
        
        session = sessions[session_id]
        
        if not openai.api_key:
            fallback = f"As {session['personality_name']}, I hear you saying: '{user_message}'. That sounds important. Can you tell me more about how that makes you feel?"
            return fallback
        
        # Build conversation context
        messages = [{"role": "system", "content": session["system_prompt"]}]
        
        # Add conversation history
        for interaction in session["conversation_history"]:
            messages.append({"role": "user", "content": interaction["user"]})
            messages.append({"role": "assistant", "content": interaction["assistant"]})
        
        # Add current message
        messages.append({"role": "user", "content": user_message})
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=250,
            temperature=0.8
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        # Store in conversation history
        session["conversation_history"].append({
            "user": user_message,
            "assistant": ai_response,
            "timestamp": datetime.now().isoformat()
        })
        
        return ai_response
        
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        personality_name = sessions[session_id]["personality_name"] if session_id in sessions else "Therapist"
        return f"As {personality_name}, I understand you're sharing something important with me. While I'm having technical difficulties right now, I want you to know that your feelings are valid. Can you tell me more about what's on your mind?"

async def fish_tts_generate(text: str, model_id: str = None) -> bytes:
    """
    Generate TTS audio using Fish Audio HTTP API
    """
    if not FISH_API_KEY:
        raise Exception("Fish API key not configured")
    
    # Use the configured model key if no model_id is provided
    if model_id is None:
        model_id = FISH_MODEL_KEY
    
    # Prepare the request data according to Fish Audio docs
    request_data = {
        "text": text,
        "reference_id": model_id,
        "format": "mp3",
        "normalize": True,
        "latency": "normal"
    }
    
    try:
        import httpx
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.fish.audio/v1/tts",
                content=msgpack.packb(request_data),
                headers={
                    "authorization": f"Bearer {FISH_API_KEY}",
                    "content-type": "application/msgpack"
                },
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise Exception(f"Fish TTS API error: {response.status_code} - {response.text}")
            
            return response.content
            
    except Exception as e:
        logger.error(f"Fish TTS error: {str(e)}")
        raise

async def fish_tts_stream(text: str, model_id: str = None):
    """
    Stream TTS audio using Fish Audio HTTP API
    Since HTTP API doesn't stream, we'll generate the full audio and yield it in chunks
    """
    try:
        audio_data = await fish_tts_generate(text, model_id)
        
        # Yield the audio in chunks to simulate streaming
        chunk_size = 8192
        for i in range(0, len(audio_data), chunk_size):
            yield audio_data[i:i + chunk_size]
            
    except Exception as e:
        logger.error(f"Fish TTS streaming error: {str(e)}")
        raise

def run_async_in_thread(coro):
    """Helper to run async function in a thread"""
    def run_in_thread():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(coro)
    
    import concurrent.futures
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(run_in_thread)
        return future.result()

@app.route('/.well-known/ai-plugin.json', methods=['GET'])
def get_manifest():
    """MCP Protocol Endpoint 1: Returns the AI plugin manifest"""
    manifest = {
        "schema_version": "v1",
        "name_for_model": "therapy_great_again",
        "name_for_human": SERVER_NAME,
        "description_for_model": SERVER_DESCRIPTION,
        "description_for_human": "An enhanced therapeutic AI assistant server with personality selection and TTS",
        "auth": {
            "type": "none"
        },
        "api": {
            "type": "openapi",
            "url": f"{request.url_root}openapi.yaml"
        },
        "logo_url": f"{request.url_root}logo.png",
        "contact_email": "support@therapygreat.com",
        "legal_info_url": f"{request.url_root}legal"
    }
    
    logger.info("Manifest requested")
    return jsonify(manifest)

@app.route('/call', methods=['POST'])
def handle_call():
    """MCP Protocol Endpoint 2: Main call handler with session support"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        inputs = data.get('inputs', {})
        message = inputs.get('message', '')
        session_id = inputs.get('session_id', '')
        
        logger.info(f"Received call - Session: {session_id}, Message: {message}")
        
        if not session_id or session_id not in sessions:
            return jsonify({
                "error": "Invalid or missing session_id. Please create a session first using /sessions/new"
            }), 400
        
        if not message:
            # Return greeting for the personality
            personality = sessions[session_id]["personality"]
            greeting = PERSONALITIES[personality]["greeting"]
            response_text = greeting
        else:
            response_text = get_therapy_response(session_id, message)
        
        response = {
            "output": response_text,
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "server": SERVER_NAME,
                "version": SERVER_VERSION,
                "session_id": session_id,
                "personality": sessions[session_id]["personality_name"]
            }
        }
        
        logger.info(f"Responding with: {response_text}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error processing call: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

@app.route('/sessions/new', methods=['POST'])
def create_new_session():
    """Create a new therapy session"""
    try:
        data = request.get_json() or {}
        personality = data.get('personality', 'default')
        
        if personality not in PERSONALITIES:
            return jsonify({
                "error": f"Invalid personality. Available: {list(PERSONALITIES.keys())}"
            }), 400
        
        session = create_session(personality)
        
        return jsonify({
            "session_id": session["id"],
            "personality": session["personality"],
            "personality_name": session["personality_name"],
            "created_at": session["created_at"],
            "greeting": PERSONALITIES[personality]["greeting"]
        })
        
    except Exception as e:
        logger.error(f"Error creating session: {str(e)}")
        return jsonify({
            "error": "Failed to create session",
            "message": str(e)
        }), 500

@app.route('/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    """Delete a therapy session"""
    try:
        if session_id not in sessions:
            return jsonify({"error": "Session not found"}), 404
        
        del sessions[session_id]
        logger.info(f"Deleted session {session_id}")
        
        return jsonify({
            "message": "Session deleted successfully",
            "session_id": session_id
        })
        
    except Exception as e:
        logger.error(f"Error deleting session: {str(e)}")
        return jsonify({
            "error": "Failed to delete session",
            "message": str(e)
        }), 500

@app.route('/sessions/<session_id>/history', methods=['GET'])
def get_session_history(session_id):
    """Get conversation history for a session"""
    try:
        if session_id not in sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = sessions[session_id]
        
        return jsonify({
            "session_id": session_id,
            "personality": session["personality_name"],
            "created_at": session["created_at"],
            "conversation_history": session["conversation_history"],
            "message_count": len(session["conversation_history"])
        })
        
    except Exception as e:
        logger.error(f"Error getting session history: {str(e)}")
        return jsonify({
            "error": "Failed to get session history",
            "message": str(e)
        }), 500

@app.route('/sessions', methods=['GET'])
def list_sessions():
    """List all active sessions"""
    try:
        session_list = []
        for session_id, session in sessions.items():
            session_list.append({
                "session_id": session_id,
                "personality": session["personality"],
                "personality_name": session["personality_name"],
                "created_at": session["created_at"],
                "message_count": len(session["conversation_history"])
            })
        
        return jsonify({
            "sessions": session_list,
            "total_sessions": len(session_list)
        })
        
    except Exception as e:
        logger.error(f"Error listing sessions: {str(e)}")
        return jsonify({
            "error": "Failed to list sessions",
            "message": str(e)
        }), 500

@app.route('/personalities', methods=['GET'])
def list_personalities():
    """List available AI personalities"""
    personality_list = []
    for key, config in PERSONALITIES.items():
        personality_list.append({
            "key": key,
            "name": config["name"],
            "greeting": config["greeting"]
        })
    
    return jsonify({
        "personalities": personality_list,
        "total_personalities": len(personality_list)
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "server": SERVER_NAME,
        "version": SERVER_VERSION,
        "timestamp": datetime.now().isoformat(),
        "openai_configured": bool(openai.api_key),
        "fish_tts_configured": bool(FISH_API_KEY),
        "active_sessions": len(sessions),
        "available_personalities": len(PERSONALITIES)
    })

@app.route('/tts/<session_id>/stream', methods=['POST'])
def stream_tts_for_session(session_id):
    """Stream TTS audio for a session's latest response"""
    try:
        if session_id not in sessions:
            return jsonify({"error": "Session not found"}), 404
        
        session = sessions[session_id]
        
        if not session["conversation_history"]:
            return jsonify({"error": "No conversation history found"}), 400
        
        # Get the latest assistant response
        latest_response = session["conversation_history"][-1]["assistant"]
        
        if not FISH_API_KEY:
            return jsonify({
                "error": "TTS not available - Fish API key not configured"
            }), 503
        
        def generate_audio_stream():
            """Generator function to stream audio chunks"""
            try:
                # Use async generator in a thread
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                async def stream_audio():
                    async for chunk in fish_tts_stream(latest_response, FISH_MODEL_KEY):
                        yield chunk
                
                # Run the async generator
                async_gen = stream_audio()
                try:
                    while True:
                        chunk = loop.run_until_complete(async_gen.__anext__())
                        yield chunk
                except StopAsyncIteration:
                    pass
                finally:
                    loop.close()
                    
            except Exception as e:
                logger.error(f"Streaming TTS generation failed: {str(e)}")
                # Send error as final chunk (frontend should handle this)
                yield b''
        
        response = Response(
            generate_audio_stream(),
            mimetype='audio/mp3',
            headers={
                'Content-Type': 'audio/mp3',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Transfer-Encoding': 'chunked'
            }
        )
        
        logger.info(f"Started streaming TTS for session {session_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error in streaming TTS endpoint: {str(e)}")
        return jsonify({
            "error": "TTS streaming failed",
            "message": str(e)
        }), 500

@app.route('/tts/<session_id>/stream/text', methods=['POST'])
def stream_tts_for_custom_text(session_id):
    """Stream TTS audio for custom text with session's personality voice"""
    try:
        if session_id not in sessions:
            return jsonify({"error": "Session not found"}), 404
        
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400
        
        text = data['text']
        
        if not FISH_API_KEY:
            return jsonify({
                "error": "TTS not available - Fish API key not configured"
            }), 503
        
        def generate_audio_stream():
            """Generator function to stream audio chunks"""
            try:
                # Use async generator in a thread
                import asyncio
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                
                async def stream_audio():
                    async for chunk in fish_tts_stream(text, FISH_MODEL_KEY):
                        yield chunk
                
                # Run the async generator
                async_gen = stream_audio()
                try:
                    while True:
                        chunk = loop.run_until_complete(async_gen.__anext__())
                        yield chunk
                except StopAsyncIteration:
                    pass
                finally:
                    loop.close()
                    
            except Exception as e:
                logger.error(f"Streaming TTS generation failed: {str(e)}")
                # Send error as final chunk
                yield b''
        
        response = Response(
            generate_audio_stream(),
            mimetype='audio/mp3',
            headers={
                'Content-Type': 'audio/mp3',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Transfer-Encoding': 'chunked'
            }
        )
        
        logger.info(f"Started streaming custom TTS for session {session_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error in custom streaming TTS endpoint: {str(e)}")
        return jsonify({
            "error": "TTS streaming failed",
            "message": str(e)
        }), 500

@app.route('/', methods=['GET'])
def root():
    """Root endpoint with server info"""
    return jsonify({
        "message": f"Welcome to {SERVER_NAME}",
        "version": SERVER_VERSION,
        "endpoints": {
            "manifest": "/.well-known/ai-plugin.json",
            "call": "/call",
            "health": "/health",
            "new_session": "/sessions/new",
            "list_sessions": "/sessions",
            "session_history": "/sessions/{id}/history",
            "delete_session": "/sessions/{id}",
            "personalities": "/personalities",
            "tts_stream_response": "/tts/{session_id}/stream",
            "tts_stream_custom": "/tts/{session_id}/stream/text"
        },
        "status": "running",
        "openai_configured": bool(openai.api_key),
        "fish_tts_configured": bool(FISH_API_KEY),
        "active_sessions": len(sessions),
        "available_personalities": list(PERSONALITIES.keys())
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    
    logger.info(f"Starting {SERVER_NAME} v{SERVER_VERSION}")
    logger.info(f"OpenAI API configured: {bool(openai.api_key)}")
    logger.info(f"Fish TTS configured: {bool(FISH_API_KEY)}")
    logger.info(f"Fish Model ID: {FISH_MODEL_KEY}")
    logger.info(f"Available personalities: {list(PERSONALITIES.keys())}")
    logger.info(f"Server will run on port {port}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.environ.get('DEBUG', 'False').lower() == 'true'
    ) 