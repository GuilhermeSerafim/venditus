# 📚 Venditus Documentation Hub

Welcome to the technical documentation for Venditus. This guide is designed to help you navigate the codebase, whether you are a frontend developer, backend engineer, or an AI agent looking for context.

## 🧭 Where to Start?

| I want to... | Read this first |
|--------------|-----------------|
| Understand the **big picture** | [System Architecture](./ARCHITECTURE.md) |
| Set up my **local environment** | [Development Guide](./DEVELOPMENT.md) |
| Work on the **UI / React** | [Frontend Architecture](./FRONTEND.md) |
| Change **Database / API** | [Backend & API](./BACKEND_API.md) |

---

## 📂 Documentation Index

### 1. [System Architecture](./ARCHITECTURE.md)
**Best for:** Everyone, especially new joiners.
- High-level diagrams of how React talks to Supabase.
- Complete tech stack list.
- Security model (Auth & RLS) explanation.

### 2. [Frontend Guide](./FRONTEND.md)
**Best for:** Frontend Developers, UI Designers.
- Directory structure of `src/`.
- Key components breakdown (Dashboards, Tables, Dialogs).
- Visualization stack (Tremor + Recharts).
- State management strategy (TanStack Query).

### 3. [Backend & API Guide](./BACKEND_API.md)
**Best for:** Backend Developers, DB Admins.
- **Database Schema**: Tables, relationships, and multi-tenancy (`organizations`).
- **Edge Functions**: Documentation for `create-user`, `delete-user`, etc.
- **Migrations**: How database changes are tracked.

### 4. [Development & Deployment](./DEVELOPMENT.md)
**Best for:** DevOps, everyone setting up the project.
- Step-by-step generic setup (`npm install`, `.env`).
- How to run locally (`npm run dev`).
- Deployment instructions for Vercel/Netlify.

---

## 🤖 For AI Agents

If you are an AI assistant helping with this project, please read **[ARCHITECTURE.md](./ARCHITECTURE.md)** first to understand the context, then refer to the specific guide relevant to the user's request.
