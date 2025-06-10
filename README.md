# 🛠️ MCP Hackathon Starter Guide

Welcome to the 3-Hour AI Hackathon! Your mission is to build an **AI-integrated tool** using the **Model Context Protocol (MCP)**. This README contains all the essentials to get started and submit your project.

---

## 🚀 Hackathon Requirements

Each team must:

1. ✅ **Implement an MCP-compatible server**
2. ✅ **Use AI (e.g., GPT-4, GPT-4o, Claude, etc.)**
3. ✅ **Demo a working /call endpoint**
4. ✅ (Optional) Add a UI for bonus points

---

## 🎨 Themes

Choose one of these fun starting points — or come up with your own!

### 🧠 Overkill Calculator

A calculator that explains every basic math problem as if it’s rocket science.  
> "What’s 2 + 2?" → "Let’s consult Newton’s laws, ancient geometry, and existential dread."

---

### 🍗 Is This Chicken?

Upload an image. GPT delivers a dramatic, philosophical breakdown of whether it’s chicken.  
> "In Plato’s cave, we might all be chickens..."

---

### 📦 Startup in a Box

Auto-generate a startup concept with AI. Prompt ideas:  

- Generate name + slogan  
- First investor pitch  
- Product roadmap  
- Simulate user feedback

---

## 🔌 MCP Protocol Specification

You must implement **two HTTP endpoints**:

### 1. `/.well-known/ai-plugin.json` (GET)

Returns a manifest with metadata about your tool.

### 2. `/call` (POST)

Accepts:

```json
{
  "inputs": {
    "message": "Hello from the user"
  }
}
```

Returns:

```json
{
  "output": "Echo: Hello from the user"
}
```

---

## 🧪 Testing

```bash
curl -X POST http://localhost:3000/call \
  -H "Content-Type: application/json" \
  -d '{"inputs": {"message": "test"}}'
```

---

## 🔑 API Keys

Store your key in a `.env`:

```bash
OPENAI_API_KEY=your-key-here
```

---

## 🌍 Hosting with ngrok

Use ngrok or pick a tool of you choice to host it

```bash
ngrok http 3000
```

---

## ✅ Submission Checklist

- Make a PR in this repository
- Live /call endpoint
- Short README with what + how

---

## Official MCP Specification & Guidess

<https://modelcontextprotocol.io>

## 🎉 Good Luck
