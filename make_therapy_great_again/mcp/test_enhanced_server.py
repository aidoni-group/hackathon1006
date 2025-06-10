#!/usr/bin/env python3
"""
Enhanced test script for the MCP server with session management and personalities
"""

import requests
import json
import sys
import time

def test_enhanced_server(base_url="http://localhost:3000"):
    """Test the enhanced MCP server with all new features"""
    
    print(f"🧠 Testing Enhanced Therapy MCP Server at {base_url}")
    print("=" * 70)
    
    # Test 1: List available personalities
    print("1. 🎭 Testing personalities endpoint...")
    try:
        response = requests.get(f"{base_url}/personalities")
        print(f"Status: {response.status_code}")
        personalities = response.json()
        print(f"Available personalities: {len(personalities['personalities'])}")
        for p in personalities['personalities']:
            print(f"  - {p['key']}: {p['name']}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 2: Create session with Trump personality
    print("2. 🏛️ Creating session with Trump personality...")
    try:
        payload = {"personality": "trump"}
        response = requests.post(f"{base_url}/sessions/new", json=payload)
        print(f"Status: {response.status_code}")
        trump_session = response.json()
        trump_session_id = trump_session["session_id"]
        print(f"Session ID: {trump_session_id}")
        print(f"Personality: {trump_session['personality_name']}")
        print(f"Greeting: {trump_session['greeting']}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 3: Create session with Greta personality
    print("3. 🌍 Creating session with Greta personality...")
    try:
        payload = {"personality": "greta"}
        response = requests.post(f"{base_url}/sessions/new", json=payload)
        print(f"Status: {response.status_code}")
        greta_session = response.json()
        greta_session_id = greta_session["session_id"]
        print(f"Session ID: {greta_session_id}")
        print(f"Personality: {greta_session['personality_name']}")
        print(f"Greeting: {greta_session['greeting']}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 4: Chat with Trump about work stress
    print("4. 💼 Testing conversation with Trump about work stress...")
    try:
        payload = {
            "inputs": {
                "session_id": trump_session_id,
                "message": "I'm feeling overwhelmed at work and my boss is being really difficult"
            }
        }
        response = requests.post(f"{base_url}/call", json=payload)
        print(f"Status: {response.status_code}")
        trump_response = response.json()
        print(f"Trump says: {trump_response['output']}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 5: Chat with Greta about anxiety
    print("5. 🌱 Testing conversation with Greta about climate anxiety...")
    try:
        payload = {
            "inputs": {
                "session_id": greta_session_id,
                "message": "I feel so anxious about climate change and feel helpless to make a difference"
            }
        }
        response = requests.post(f"{base_url}/call", json=payload)
        print(f"Status: {response.status_code}")
        greta_response = response.json()
        print(f"Greta says: {greta_response['output']}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 6: Continue conversation with Trump
    print("6. 🔄 Continue conversation with Trump...")
    try:
        payload = {
            "inputs": {
                "session_id": trump_session_id,
                "message": "Thanks for the advice. But I'm still worried about job security"
            }
        }
        response = requests.post(f"{base_url}/call", json=payload)
        print(f"Status: {response.status_code}")
        trump_response2 = response.json()
        print(f"Trump says: {trump_response2['output']}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 7: List all sessions
    print("7. 📋 Testing list sessions...")
    try:
        response = requests.get(f"{base_url}/sessions")
        print(f"Status: {response.status_code}")
        sessions_data = response.json()
        print(f"Active sessions: {sessions_data['total_sessions']}")
        for session in sessions_data['sessions']:
            print(f"  - {session['session_id'][:8]}... ({session['personality_name']}) - {session['message_count']} messages")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 8: Get conversation history
    print("8. 📜 Testing conversation history...")
    try:
        response = requests.get(f"{base_url}/sessions/{trump_session_id}/history")
        print(f"Status: {response.status_code}")
        history = response.json()
        print(f"Session with {history['personality']} - {history['message_count']} messages:")
        for i, msg in enumerate(history['conversation_history'], 1):
            print(f"  {i}. User: {msg['user'][:50]}...")
            print(f"     AI: {msg['assistant'][:50]}...")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 9: Create Yoda session for variety
    print("9. 🌌 Creating Yoda session...")
    try:
        payload = {"personality": "yoda"}
        response = requests.post(f"{base_url}/sessions/new", json=payload)
        print(f"Status: {response.status_code}")
        yoda_session = response.json()
        yoda_session_id = yoda_session["session_id"]
        print(f"Yoda greeting: {yoda_session['greeting']}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 10: Chat with Yoda
    print("10. 🌟 Testing conversation with Yoda...")
    try:
        payload = {
            "inputs": {
                "session_id": yoda_session_id,
                "message": "I keep getting angry at small things and I don't know why"
            }
        }
        response = requests.post(f"{base_url}/call", json=payload)
        print(f"Status: {response.status_code}")
        yoda_response = response.json()
        print(f"Yoda says: {yoda_response['output']}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 11: Delete a session
    print("11. 🗑️ Testing session deletion...")
    try:
        response = requests.delete(f"{base_url}/sessions/{greta_session_id}")
        print(f"Status: {response.status_code}")
        delete_response = response.json()
        print(f"Result: {delete_response['message']}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 12: Verify session is deleted
    print("12. ✅ Verifying session deletion...")
    try:
        response = requests.get(f"{base_url}/sessions")
        sessions_data = response.json()
        print(f"Active sessions after deletion: {sessions_data['total_sessions']}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 13: Test error handling - invalid session
    print("13. ❌ Testing error handling (invalid session)...")
    try:
        payload = {
            "inputs": {
                "session_id": "invalid-session-id",
                "message": "This should fail"
            }
        }
        response = requests.post(f"{base_url}/call", json=payload)
        print(f"Status: {response.status_code}")
        error_response = response.json()
        print(f"Error message: {error_response['error']}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    print("🎉 All enhanced tests completed successfully!")
    print(f"Final status: {requests.get(f'{base_url}/health').json()}")
    return True

if __name__ == "__main__":
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
    test_enhanced_server(base_url) 