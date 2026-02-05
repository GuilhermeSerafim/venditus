# 💼 Venditus - Sistema de Gestão Empresarial

> Sistema completo de gestão para consultoria, com módulos de CRM, vendas, eventos, produtos e fluxo de caixa.

[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

## 📚 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Deploy](#-deploy)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação](#-documentação)

## 🎯 Sobre o Projeto

**Venditus** é um sistema moderno de gestão empresarial desenvolvido para consultoria, oferecendo uma interface premium com tema claro/escuro e dashboards executivos para análise de dados em tempo real.

### ✨ Destaques

- 🎨 **UI Premium** - Design system com identidade visual em dourado
- 🌓 **Tema Claro/Escuro** - Suporte completo a dark mode
- 📱 **Responsivo** - Interface adaptável para desktop, tablet e mobile
- 🔐 **Segurança** - Row Level Security (RLS) com Supabase
- 📊 **Analytics** - Dashboards interativos com Recharts
- ⚡ **Performance** - Otimizado com React Query e Vite

## 🚀 Funcionalidades

### Módulos Principais

| Módulo | Descrição |
|--------|-----------|
| 📊 **Dashboard** | Visão executiva com métricas e KPIs em tempo real |
| 💰 **Fluxo de Caixa** | Gestão de receitas, despesas e saldo consolidado |
| 📈 **Vendas** | Controle completo de vendas e comissões |
| 👥 **Leads** | CRM para gestão de leads e pipeline de vendas |
| 📅 **Eventos** | Agendamento e controle de eventos comerciais |
| 📦 **Produtos** | Catálogo de produtos e serviços |
| 📤 **Exportação** | Exportar dados para Excel/CSV |
| 👤 **Usuários** | Gestão de usuários e permissões (Admin) |

### Funcionalidades Detalhadas

- ✅ Autenticação segura com Supabase Auth
- ✅ Filtros por data e pesquisa em tempo real
- ✅ Gráficos interativos de receitas e despesas
- ✅ Sistema de permissões baseado em roles
- ✅ CRUD completo para todos os módulos
- ✅ Validação de formulários com Zod
- ✅ Notificações toast para feedback

## 🛠️ Tecnologias

### Core

| Tech | Versão | Descrição |
|------|--------|-----------|
| [React](https://react.dev/) | ^18.3.1 | Biblioteca UI |
| [TypeScript](https://www.typescriptlang.org/) | ^5.8.3 | Superset JavaScript |
| [Vite](https://vitejs.dev/) | ^5.4.19 | Build tool |

### UI/UX

| Tech | Versão | Descrição |
|------|--------|-----------|
| [Tailwind CSS](https://tailwindcss.com/) | ^3.4.17 | Framework CSS |
| [shadcn/ui](https://ui.shadcn.com/) | Latest | Componentes UI |
| [Lucide React](https://lucide.dev/) | ^0.462.0 | Ícones |
| [Recharts](https://recharts.org/) | ^2.15.4 | Gráficos |

### Backend & Infra

| Tech | Versão | Descrição |
|------|--------|-----------|
| [Supabase](https://supabase.com/) | ^2.83.0 | Backend as a Service |
| [TanStack Query](https://tanstack.com/query) | ^5.83.0 | Data fetching |
| [React Router](https://reactrouter.com/) | ^6.30.1 | Roteamento |

### Tools

- **Forms:** React Hook Form + Zod
- **Dates:** date-fns
- **State:** TanStack Query (React Query)
- **Styling:** Tailwind + CSS Variables

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18.0.0
- [npm](https://www.npmjs.com/) ou [bun](https://bun.sh/)
- Conta no [Supabase](https://supabase.com/)

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/GuilhermeSerafim/venditus.git
cd venditus
```

### 2. Instale as dependências

```bash
# Com npm
npm install

# Ou com bun (mais rápido)
bun install
```

## ⚙️ Configuração

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_PROJECT_ID="seu_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua_anon_key"
VITE_SUPABASE_URL="https://seu_project_id.supabase.co"
```

### 2. Configurar Supabase

#### Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie as credenciais para o `.env`

#### Executar Migrações

```bash
# Navegar até a pasta de migrations
cd supabase/migrations

# Executar as migrations no Supabase Dashboard
# SQL Editor > New Query > Cole o conteúdo dos arquivos de migração
```

**Migrations principais:**
- `20250124000000_initial_schema.sql` - Schema inicial
- `20260204211500_fix_expenses_revenues_rls.sql` - RLS policies

## 🎮 Uso

### Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

### Build de Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

### Credenciais Iniciais

Após configurar o Supabase, crie seu primeiro usuário na tela de cadastro. O primeiro usuário será automaticamente admin.

## 🌐 Deploy

### Deploy no Vercel

1. **Conecte o repositório** no [Vercel](https://vercel.com)
2. **Configure as variáveis de ambiente:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. **Deploy automático** - Vercel detecta Vite automaticamente
4. **Framework Preset:** Vite
5. **Build Command:** `npm run build` (detectado automaticamente)
6. **Output Directory:** `dist` (detectado automaticamente)

> **Nota:** Ignore o aviso sobre `VITE_SUPABASE_PUBLISHABLE_KEY` - essa chave é pública por design.

### Deploy Alternativo

O projeto também pode ser deployado em:
- [Netlify](https://www.netlify.com/)
- [Render](https://render.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

## 📁 Estrutura do Projeto

```
venditus/
├── docs/                          # Documentação
│   └── DESIGN_SYSTEM.md          # Design system completo
├── public/                        # Assets estáticos
├── src/
│   ├── assets/                   # Imagens e logos
│   ├── components/               # Componentes React
│   │   ├── ui/                  # Componentes base (shadcn/ui)
│   │   ├── AppLayout.tsx        # Layout principal
│   │   ├── AppSidebar.tsx       # Navegação lateral
│   │   └── ModernHeader.tsx     # Header com tema
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.tsx          # Autenticação
│   │   ├── useTheme.tsx         # Tema claro/escuro
│   │   └── useRoles.tsx         # Controle de permissões
│   ├── integrations/
│   │   └── supabase/            # Cliente Supabase
│   ├── lib/                      # Utilitários
│   ├── pages/                    # Páginas/rotas
│   │   ├── Index.tsx            # Dashboard
│   │   ├── CashFlow.tsx         # Fluxo de caixa
│   │   ├── Sales.tsx            # Vendas
│   │   ├── Leads.tsx            # Leads
│   │   └── ...
│   ├── index.css                 # Tokens de design
│   ├── App.tsx                   # Rotas e providers
│   └── main.tsx                  # Entry point
├── supabase/
│   └── migrations/               # Migrations SQL
├── .env.example                  # Template de variáveis
├── package.json
├── tailwind.config.ts            # Config Tailwind
├── tsconfig.json                 # Config TypeScript
└── vite.config.ts               # Config Vite
```

## 📖 Documentação

### Design System

Acesse a documentação completa do design system em:
📄 [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)

**Inclui:**
- Tokens de design (cores, tipografia, espaçamentos)
- Componentes UI com exemplos
- Guia de responsividade
- Padrões de layout
- Tema claro e escuro

### Arquitetura

- **Frontend:** React SPA com routing client-side
- **Backend:** Supabase (PostgreSQL + APIs REST)
- **Segurança:** Row Level Security (RLS) no banco
- **State:** TanStack Query para cache e sincronização

### Como Contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 License

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Guilherme Serafim**

- GitHub: [@GuilhermeSerafim](https://github.com/GuilhermeSerafim)

## 🙏 Agradecimentos

- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS

---

⭐ Se este projeto foi útil, considere dar uma estrela no repositório!
