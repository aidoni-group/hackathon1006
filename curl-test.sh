#!/bin/bash
curl -X POST http://localhost:3000/call \
  -H "Content-Type: application/json" \
  -d '{"inputs": {"message": "Hello world"}}'