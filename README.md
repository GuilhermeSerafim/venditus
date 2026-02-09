# 💼 Venditus - Gestão para Consultoria & Educação

Sistema SaaS White-Label completo para gestão de empresas de consultoria e educação, com foco em CRM, financeiro e múltiplos inquilinos (multi-tenant).

## 🚀 Diferenciais

- **White-Label Nativo**: Personalização completa de cores, logo e tema por organização.
- **Multi-Tenancy**: Dados isolados por organização via RLS (Row Level Security) no Supabase.
- **CRM Integrado**: Funil de vendas, gestão de leads e conversão automática Lead → Cliente.
- **Gestão Financeira**: Fluxo de caixa, receitas, despesas e metas mensais.

## 🛠️ Stack Tecnológico

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Tremor & Recharts

## 📦 Módulos Principais

1.  **Dashboard Executivo**: KPIs em tempo real.
2.  **Vendas (CRM)**: Tabela paginada, status de pagamento, comissões.
3.  **Leads**: Gestão de contatos com diferenciação visual Lead vs Cliente.
4.  **Financeiro**: Controle de caixa e formas de pagamento.
5.  **Eventos**: Gestão de participantes e check-in.
6.  **Configurações**: Personalização da marca (White-label).

## ⚡ Como Rodar

### Pré-requisitos
- Node.js 18+
- Conta no Supabase

### Passo a Passo

1.  **Clone o repo:**
    ```bash
    git clone https://github.com/GuilhermeSerafim/venditus.git
    cd venditus
    ```

2.  **Instale dependências:**
    ```bash
    npm install
    ```

3.  **Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz:
    ```env
    VITE_SUPABASE_URL=sua_url_supabase
    VITE_SUPABASE_PUBLISHABLE_KEY=sua_key_supabase
    ```

4.  **Rodar:**
    ```bash
    npm run dev
    ```

Acesse: http://localhost:5173

---

© 2026 Venditus Inc.
