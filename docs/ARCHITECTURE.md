# System Architecture - Venditus

## High-Level Overview

Venditus is a **Single Page Application (SPA)** built with React, designed for high performance and scalability. It leverages a **Serverless** architecture using Supabase for the backend, database, and authentication.

```mermaid
graph TD
    User[User / Browser] -->|HTTPS| CDN[CDN / Hosting (Vercel/Netlify)]
    CDN -->|Serves| SPA[React SPA (Vite)]
    
    subgraph Client [Client Side]
        SPA -->|State| ReactQuery[TanStack Query]
        SPA -->|Routing| Router[React Router]
        SPA -->|UI| Shadcn[shadcn/ui]
    end

    subgraph Backend [Supabase PaaS]
        SPA -->|REST/Realtime| SupabaseAPI[Supabase API]
        SupabaseAPI -->|Auth| GoTrue[GoTrue Auth]
        SupabaseAPI -->|Query| Postgres[PostgreSQL DB]
        SPA -->|Invoke| EdgeFunctions[Edge Functions (Deno)]
    end

    EdgeFunctions -->|Admin Actions| SupabaseAPI
```

## Technology Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| **Frontend** | React 18.3 | Core UI library. |
| **Build Tool** | Vite 5.4 | Fast development server and bundler. |
| **Language** | TypeScript | Strictly typed JavaScript for robustness. |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS framework. |
| **Components** | shadcn/ui | Reusable components built on Radix UI. |
| **Visualization** | Tremor + Recharts | Dashboard components and charts. |
| **State** | TanStack Query | Server state management and caching. |
| **Backend** | Supabase | Open source Firebase alternative. |
| **Database** | PostgreSQL | Relational database with RLS. |
| **Auth** | Supabase Auth | User management and policies. |
| **Serverless** | Deno | Runtime for Supabase Edge Functions. |

## Security Model

### Authentication
- Uses **Supabase Auth** (GoTrue).
- Supports Email/Password login.
- JSON Web Tokens (JWT) are used for session management.

### Authorization (RLS)
- **Row Level Security (RLS)** is enabled on all tables.
- Access is controlled via PostgreSQL policies.
- **Roles:**
  - `admin`: Full access.
  - `vendedor`: Operational access (Leads, Sales).
  - `visualizador`: Read-only access to dashboards.

### Edge Function Security
- Functions are invoked with the user's JWT.
- `service_role` key is used strictly within Edge Functions for administrative tasks (e.g., user deletion) that bypass RLS where necessary.
