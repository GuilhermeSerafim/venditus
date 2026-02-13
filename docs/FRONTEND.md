# Frontend Architecture - Venditus

The frontend is a Single Page Application (SPA) built with React and Vite. It emphasizes component reusability and a "shadcn/ui" design system.

## Directory Structure (`src/`)

```
src/
├── components/         # Reusable UI components & Feature-specific widgets
│   ├── ui/             # Generic atomic components (shadcn/ui)
│   ├── *Dialog.tsx     # Modals for creating/editing entities
│   ├── *Table.tsx      # Data tables (Leads, Sales, etc.)
│   └── *Chart.tsx      # Visualization components (Recharts)
├── pages/              # Route components (Views)
├── hooks/              # Custom React hooks (logic reuse)
├── integrations/       # Supabase client & generated types
├── lib/                # Utilities (utils.ts)
└── assets/             # Images and global styles
```

## Key Components

### Layouts
*   **`AppLayout.tsx`**: The main wrapper for authenticated pages. It includes the `AppSidebar` and handles the responsive layout.
*   **`AppSidebar.tsx`**: The navigation menu, adapting to mobile/desktop screens.

### Feature Modules
The application is modularized by business domain.

#### Dashboard
*   **`ExecutiveDashboard.tsx`**: The main landing view. Aggregates metrics from various sources.
*   **`ModernCard.tsx` / `MetricCard.tsx`**: specialized cards for displaying KPI data.

#### Leads & CRM
*   **`LeadsTable.tsx`**: Complex data grid with filtering and sorting.
*   **`AddLeadDialog.tsx` / `EditLeadDialog.tsx`**: Forms for lead management using `react-hook-form` and `zod`.
*   **`LeadDetailsDialog.tsx`**: A comprehensive view of a lead, including their interaction timeline.

#### Sales & Finance
*   **`SalesTable.tsx`**: Renders sales data.
*   **`CashFlowModule.tsx`**: Handles financial reporting (Revenues vs Expenses).

### Visualization
*   **Tremor**: Used for high-level dashboard metrics and specific chart types (e.g., Donut charts).
*   **Recharts**: Used for complex, custom visualizations where fine-grained control is needed. (e.g., `EventConversionFunnel.tsx`).

## State Management

1.  **Server State**: `TanStack Query` is used for fetching and caching data from Supabase.
    *   Automatic caching and background refetching.
    *    optimistic updates for better UX.
2.  **Local State**: `useState` and `useReducer` for simple UI interactions (modals open/close).
3.  **Global UI State**: Context API is used for:
    *   `ThemeProvider`: Dark/Light mode.
    *   `Auth`: User session (via Supabase Auth listener).

## Routing
*   **React Router DOM** handles client-side routing.
*   **Private Routes**: Authentication checks prevent unauthorized access to protected pages.

## styling
*   **Tailwind CSS**: Used for all styling.
*   **`index.css`**: Global variables and Tailwind directives.
