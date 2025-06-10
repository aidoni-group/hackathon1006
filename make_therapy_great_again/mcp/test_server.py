#!/usr/bin/env python3
"""
Test script for the MCP server
"""

import requests
import json
import sys

def test_server(base_url="http://localhost:3000"):
    """Test the MCP server endpoints"""
    
    print(f"Testing MCP server at {base_url}")
    print("=" * 50)
    
    # Test 1: Health check
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 2: Manifest endpoint
    print("2. Testing manifest endpoint...")
    try:
        response = requests.get(f"{base_url}/.well-known/ai-plugin.json")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 3: Call endpoint with message
    print("3. Testing call endpoint with message...")
    try:
        payload = {
            "inputs": {
                "message": "I'm feeling anxious about work"
            }
        }
        response = requests.post(
            f"{base_url}/call",
            headers={"Content-Type": "application/json"},
            json=payload
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    # Test 4: Call endpoint without message
    print("4. Testing call endpoint without message...")
    try:
        payload = {
            "inputs": {}
        }
        response = requests.post(
            f"{base_url}/call",
            headers={"Content-Type": "application/json"},
            json=payload
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print()
    except Exception as e:
        print(f"Error: {e}")
        return False
    
    print("✅ All tests completed!")
    return True

if __name__ == "__main__":
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
    test_server(base_url) 