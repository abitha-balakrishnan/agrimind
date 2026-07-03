# AgriMind: Multi-Agent AI Advisory Platform

AgriMind is a sophisticated AI architecture designed to bring highly specialized, contextual farming advice directly to the hands of farmers. 
Instead of relying on a single generalized language model, AgriMind utilizes an Orchestrator pattern dividing labor across 5 domain-specific AI agents, backed by a persistent RAG Vector Database, with a 6th asynchronous agent pushing alerts over SMS.

## Features & Deliverables Met

- **5 Specialist Agents + 1 Orchestrator + 1 Alert Agent:** Implemented separately in `backend/agents/`.
- **Prompt Engineering & RAG:** Agents dynamically pull from ChromaDB (Crop & Pest collections). Prompts include strict JSON enforcement schemas and chain-of-thought instructions.
- **Claude API Integration:** Uses `@anthropic-ai/sdk` for both text-based reasoning and image-based vision inspection (Pest Scanner).
- **Multiple Databases:** MongoDB for structured user history and ChromaDB for embedding knowledge bases.
- **Express Backend:** Modular REST architecture.
- **React + Tailwind Frontend:** Distinct earthy palette (sage green, wheat, terracotta) lacking generic SaaS components. Unique horizontal progression visualization mapped in `AgentTimeline`.
- **Twilio SMS Alert Agent:** A scheduled Cron agent testing thresholds and blasting updates.
- **Architecture Flowcharts:** Included as Mermaid.js definitions in `ARCHITECTURE.md` and visually live on the `/how-it-works` route in the frontend. 
- **Dockerization:** `backend`, `frontend`, `mongo`, and `chroma` all integrated seamlessly via `docker-compose.yml`. Instructions are in `DEPLOYMENT.md`.

## Running Locally

1. Create a `.env` inside `backend/` from `.env.example` and add your Claude API key.
2. Run `docker-compose up -d` at the root directory.
3. Upon first launch, seed the Vector DB:
   `docker-compose exec backend npm run seed`
4. Access the UI at `http://localhost:8080`.
