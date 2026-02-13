# Development Guide - Venditus

This guide covers how to set up the development environment, run the application locally, and deploy it.

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Supabase CLI** (optional, for local backend development)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd venditus
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    bun install
    ```

3.  **Environment Variables:**
    Copy `.env.example` to `.env` and fill in your Supabase credentials:
    ```bash
    cp .env.example .env
    ```
    
    **Required Variables:**
    | Variable | Description |
    |----------|-------------|
    | `VITE_SUPABASE_URL` | Your Supabase Project URL (e.g., `https://xyz.supabase.co`) |
    | `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API Key (anon) |
    | `VITE_SUPABASE_PROJECT_ID` | Project ID string |

## Running Locally

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Backend Development (Supabase)

If you are modifying the database or Edge Functions:

1.  **Link your project:**
    ```bash
    npx supabase link --project-ref <your-project-id>
    ```

2.  **Deploy Edge Functions:**
    ```bash
    npx supabase functions deploy create-user
    npx supabase functions deploy delete-user
    ```

3.  **Database Migrations:**
    Migrations are located in `supabase/migrations`.
    To apply them locally (if using local Supabase):
    ```bash
    npx supabase db reset
    ```

## Building for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist/` directory.

## Deployment

### Frontend (Vercel / Netlify)
Connect your GitHub repository to Vercel or Netlify. The build settings are usually auto-detected:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Backend
Supabase handles the backend infrastructure. Ensure your production database has the same schema as your development environment by applying migrations.
