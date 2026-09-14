# OmniWork

> **An interruption-awareness workspace for modern teams.**

OmniWork helps teams communicate **when to interrupt, why to interrupt, and when to wait**.

Instead of relying on constant notifications and guessing whether a teammate is available, OmniWork gives every person a clear work context and helps route communication respectfully.

---

## 🌐 Live Demo

### GitHub Pages

**https://joeljery.github.io/omniwork/**

The GitHub Pages deployment provides a fully functional browser-based demo.

The frontend automatically uses the local demo data layer when a production API is not configured or cannot be reached.

---

# ✨ Features

## 🧠 Work Context

Each teammate can communicate their current working state:

- **Focus**
- **Available**
- **Away**

A work context can include:

- Current project
- Current task
- Status message
- What is worth interrupting for
- Optional expiration time

This lets teammates understand someone's availability before sending an interruption.

---

## 👥 Team Awareness

OmniWork provides a team-wide view of:

- Current teammate status
- Active work context
- Projects
- Tasks
- Availability
- Interruptibility boundaries

The goal is to make team communication more intentional without requiring people to constantly explain their availability.

---

## 💬 Respectful Messaging

Messages can be categorized by urgency:

- Quick question
- Important
- Urgent

Messages are queued and associated with the recipient's current context.

---

## 🚦 Interruption Evaluation

OmniWork can evaluate whether an interruption is appropriate based on:

- The recipient's status
- Their current task
- Their interruption preferences
- The urgency of the request
- Available team context

---

## 📝 Status Message Generation

OmniWork can help create concise status messages from natural-language input.

For example:

> "I'm working on the checkout bug and don't want interruptions unless production is affected."

can become a structured work context.

---

## 🤖 AI Assistance

The application includes AI-powered functionality for:

- Structuring work context
- Generating status messages
- Evaluating interruptions
- Generating messages
- Explaining work events
- Creating catch-up summaries
- Team recommendations
- OmniWork questions

The server uses Google's Gemini API when `GEMINI_API_KEY` is configured.

If the backend or Gemini API is unavailable, the GitHub Pages demo uses local fallback behavior.

---

## 📋 Catch-Up

OmniWork can summarize important recent team activity so teammates can catch up without reading every event individually.

---

## 🔌 Integrations

The application includes an integration-awareness layer for services such as:

- Slack
- GitHub
- Zoom
- Project Workspace
- Meeting Notes

The current implementation represents integration state inside OmniWork. External service synchronization can be connected through the backend as the project evolves.

---

# 🏗️ Architecture

OmniWork uses a hybrid architecture.

```text
                         ┌─────────────────────────┐
                         │       GitHub Pages      │
                         │                         │
                         │   React + Vite frontend │
                         └────────────┬────────────┘
                                      │
                         HTTPS API    │
                                      ▼
                         ┌─────────────────────────┐
                         │     Express Backend     │
                         │                         │
                         │   REST API + AI logic  │
                         └────────────┬────────────┘
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                         ▼                         ▼
                ┌─────────────────┐       ┌─────────────────┐
                │ Supabase /      │       │ Gemini API      │
                │ PostgreSQL      │       │                 │
                └─────────────────┘       └─────────────────┘
