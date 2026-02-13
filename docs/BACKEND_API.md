# Backend & API Documentation - Venditus

## Database Schema (PostgreSQL)

Venditus uses a relational database hosted on Supabase. The schema is designed for multi-tenancy (White Label) where data is segregated by `organization_id`.

### Core Tables

#### `organizations` (Multi-tenancy)
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary Key. |
| `name` | text | Organization name. |
| `slug` | text | Unique URL-friendly identifier. |
| `theme_config` | jsonb | Custom branding (colors, logo). |

#### `profiles` (Users)
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | References `auth.users(id)`. |
| `organization_id` | uuid | References `organizations(id)`. |
| `email` | text | User email. |
| `full_name` | text | User display name. |

#### Business Entities
Most business tables include `organization_id` for RLS.

*   **`leads`**: Potential clients.
*   **`sales`**: Sales records linked to leads and products.
*   **`events`**: Educational events/webinars.
*   **`products`**: Items available for sale.
*   **`interactions`**: History of calls/emails with leads.
*   **`projects`**: Project management module linked to leads.
*   **`project_tasks`**: Tasks within a project.

### Row Level Security (RLS)

RLS is enabled on ALL tables to ensure data isolation.

*   **Isolation**: Users can only (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) rows where `organization_id` matches their own `organization_id`.
*   **Helper Function**: `get_auth_organization_id()` is used in policies to retrieve the current user's org ID efficiently.

---

## Edge Functions (Serverless API)

Supabase Edge Functions are used for privileged operations that cannot be safely performed directly from the client.

### 1. `create-user`
Creates a new user in Supabase Auth and assigns them to an organization/role.

*   **Method**: `POST`
*   **Auth Required**: Yes (Bearer Token, Admin role)
*   **Endpoints**: `https://<project-ref>.supabase.co/functions/v1/create-user`
*   **Payload**:
    ```json
    {
      "email": "user@example.com",
      "password": "securePassword123",
      "name": "John Doe",
      "role": "vendedor",
      "organization_id": "uuid-of-organization"
    }
    ```
*   **Logic**:
    1. Verifies if the requestor is an `admin`.
    2. Creates the user via `supabaseAdmin` client.
    3. Inserts a record into `user_roles`.

### 2. `delete-user`
Safely removes a user and their associations.

*   **Method**: `POST`
*   **Auth Required**: Yes (Bearer Token, Admin role)
*   **Endpoints**: `https://<project-ref>.supabase.co/functions/v1/delete-user`
*   **Payload**:
    ```json
    {
      "userId": "uuid-of-user-to-delete"
    }
    ```
*   **Logic**:
    1. Verifies if the requestor is an `admin`.
    2. Prevents self-deletion.
    3. Deletes the user via `supabaseAdmin` client.

## Migrations

Database changes are tracked in `supabase/migrations/`. 
Key migrations include:
*   `20260205170000_white_label_schema.sql`: Implemented multi-tenancy.
*   `20260209_projects_module.sql`: Added Projects and Tasks tables.
