# 📊 HUIL Private Educacional - Overview do Projeto

## 🎯 Propósito do Sistema

**Sistema Completo de Gestão Executiva e CRM** para consultoria educacional (Private Consultancy). 

Uma plataforma integrada para gerenciar todo o ciclo de vendas, desde a captação de leads até o fechamento de vendas e acompanhamento financeiro.

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend** | React 18.3 + TypeScript |
| **Build Tool** | Vite 5.4 |
| **Routing** | React Router DOM 6.30 |
| **UI Framework** | shadcn/ui + Radix UI |
| **Styling** | Tailwind CSS 3.4 |
| **State Management** | TanStack Query (React Query) 5.83 |
| **Backend/Database** | Supabase (PostgreSQL) |
| **Autenticação** | Supabase Auth |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts 2.15 |
| **Icons** | Lucide React |
| **Fonts** | Inter + Plus Jakarta Sans |

### Estrutura de Pastas

```
src/
├── components/        # 43+ componentes React (UI, formulários, dashboards)
├── pages/            # 11 páginas principais
├── hooks/            # 5 custom hooks (auth, roles, theme, toast, mobile)
├── integrations/     # Integração com Supabase
├── lib/              # Utilitários (utils.ts)
└── assets/           # Recursos estáticos
```

---

## 📱 Funcionalidades Principais

### 1. 🔐 **Autenticação e Controle de Acesso**
- Login/Registro via Supabase Auth
- Sistema de roles (Admin, Vendedor, Visualizador)
- Proteção de rotas com `ProtectedRoute`
- Gerenciamento de usuários
- Interface moderna de autenticação

### 2. 📊 **Dashboard Executivo** (Página Principal)
**Localização**: `/` (Index)

Visão completa do negócio com métricas em tempo real:

#### Métricas Principais:
- 👥 **Total de Leads** cadastrados
- 🛍️ **Total de Vendas** + ticket médio
- 💰 **Receita Líquida** (vendas + receitas extras)
- 💵 **Receita Total Vendida**
- 💼 **Receita em Aberto** (a receber)
- 📈 **Ticket Médio**
- 💸 **Receita Extra** (adicional)

#### Gráficos e Análises:
- 📊 **Gráfico de Pizza**: Distribuição de leads por fonte
- 🔄 **Funil de Conversão**: Eventos e conversões
- 💳 **Dashboard de Métodos de Pagamento**
- 📊 **Comparativo de Receita**: Vendida x Líquida x Em Aberto
- 📈 **Evolução Mensal**: Receita líquida dos últimos 6 meses

### 3. 👥 **Gestão de Leads** 
**Localização**: `/leads`

- Cadastro completo de leads
- Informações: nome, email, telefone, status
- Vinculação com eventos
- Timeline de interações
- Status personalizados
- Notas e observações
- Visualização detalhada de cada lead

### 4. 🎫 **Gestão de Eventos**
**Localização**: `/eventos`

- Criação e gerenciamento de eventos educacionais
- Controle de capacidade
- Métricas de evento:
  - Total de leads convidados
  - Confirmados
  - Presentes (attended)
  - Conversões para negociação
  - Vendas fechadas
- Funil de conversão por evento
- Status: invited, confirmed, attended, no_show, cancelled

### 5. 💬 **Interações com Leads**
**Tipos de Interação**:
- 📞 Ligações (call)
- 📧 Emails
- 🤝 Reuniões (meeting)
- 💬 WhatsApp
- 🎫 Eventos
- 💰 Vendas (sale)
- 🔄 Follow-ups
- 📝 Outros

**Recursos**:
- Registro de outcome (resultado)
- Próxima ação sugerida
- Data da próxima ação
- Descrição detalhada
- Criador da interação

### 6. 💰 **Gestão de Vendas**
**Localização**: `/vendas`

Controle completo do pipeline de vendas:

**Dados por Venda**:
- Lead associado
- Produto vendido
- 💵 Valor vendido (`sold_value`)
- 💸 Valor em aberto (`outstanding_value`)
- 💰 Valor líquido (`net_value`)
- Data da venda
- Data prevista de pagamento
- Data de pagamento efetivo
- Status: pending, partial, paid
- Nome do vendedor
- Observações

### 7. 📦 **Catálogo de Produtos**
**Localização**: `/produtos`

- Cadastro de produtos/serviços
- Nome, descrição e preço
- Vinculação com vendas

### 8. 💼 **Fluxo de Caixa**
**Localização**: `/caixa`

Sistema completo de gestão financeira mensal:

#### Métricas Financeiras:
- 💵 **Receita Vendida**: Total de vendas do mês
- ➕ **Receitas Extras**: Receitas adicionais
- 💼 **A Receber**: Valores em aberto
- 📉 **Despesas**: Total de despesas
- 💰 **Saldo do Mês**: Receita - Despesas

#### Recursos:
- Gráfico comparativo Receita x Despesa
- Tabela de receitas extras com categorias
- Tabela de despesas com tipos
- Filtro automático por mês atual
- Adicionar receitas e despesas (apenas Admin/Vendedor)

**Tabelas Envolvidas**:
- `revenues` - Receitas extras
- `expenses` - Despesas
- `sales` - Vendas (para calcular receita vendida)

### 9. 📤 **Exportação de Dados**
**Localização**: `/exportar`

Sistema de exportação de dados para análise externa.

### 10. 👤 **Gerenciamento de Usuários**
**Localização**: `/usuarios`

- Listagem de usuários do sistema
- Atribuição de roles
- Controle de permissões
- Apenas para administradores

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais (11 tabelas):

#### 1. **`leads`** - Leads/Contatos
```sql
- id (uuid)
- name (text) 
- email (text)
- phone (text)
- status (text) - 'lead', 'confirmed', 'attended', etc.
- event_id (uuid) - FK para events
- notes (text)
- created_at, updated_at
```

#### 2. **`events`** - Eventos Educacionais
```sql
- id (uuid)
- name (text)
- event_date (date)
- location (text)
- capacity (int)
- leads_count, confirmed_count, attended_count (int)
- negotiation_count, purchased_count (int)
- created_at, updated_at
```

#### 3. **`lead_events`** - Relacionamento Lead-Evento
```sql
- id (uuid)
- lead_id (uuid) - FK para leads
- event_id (uuid) - FK para events
- status - 'invited', 'confirmed', 'attended', 'no_show', 'cancelled'
- registered_at
- notes
- UNIQUE (lead_id, event_id)
```

#### 4. **`interactions`** - Interações com Leads
```sql
- id (uuid)
- lead_id (uuid) - FK para leads
- interaction_type - 'call', 'email', 'meeting', 'whatsapp', etc.
- interaction_date (timestamp)
- description (text)
- outcome (text)
- next_action (text)
- next_action_date (date)
- created_by (text)
- created_at, updated_at
```

#### 5. **`products`** - Produtos/Serviços
```sql
- id (uuid)
- name (text)
- description (text)
- price (numeric)
- created_at, updated_at
```

#### 6. **`sales`** - Vendas
```sql
- id (uuid)
- lead_id (uuid) - FK para leads
- product_id (uuid) - FK para products
- sold_value (numeric) - valor total vendido
- outstanding_value (numeric) - valor em aberto
- net_value (numeric) - valor líquido recebido
- sale_date (date)
- expected_payment_date (date)
- paid_date (date)
- payment_status - 'pending', 'partial', 'paid'
- seller_name (text)
- notes (text)
- created_at, updated_at
```

#### 7. **`revenues`** - Receitas Extras
```sql
- id (uuid)
- name (text)
- amount (numeric)
- revenue_date (date)
- category (text)
- payment_method (text)
- created_at, updated_at
```

#### 8. **`expenses`** - Despesas
```sql
- id (uuid)
- name (text)
- amount (numeric)
- expense_date (date)
- type (text)
- payment_method (text)
- created_at, updated_at
```

#### 9. **`profiles`** - Perfis de Usuários
```sql
- id (uuid) - FK para auth.users
- email (text)
- full_name (text)
- created_at, updated_at
```

#### 10. **`user_roles`** - Roles dos Usuários
```sql
- id (uuid)
- user_id (uuid) - FK para profiles
- role (text) - 'admin', 'vendedor', 'visualizador'
- created_at
```

#### 11. **`custom_dashboards`** - Dashboards Personalizados
```sql
- id (uuid)
- user_id (uuid)
- name (text)
- config (jsonb)
- is_shared (boolean)
- created_at, updated_at
```

### 🔒 Segurança (Row Level Security)

**Todas as tabelas têm RLS habilitado** com políticas que:
- ✅ Permitem acesso apenas para usuários autenticados
- ✅ Controlam operações CRUD por role
- ✅ Protegem dados sensíveis

### ⚡ Performance

**Índices Otimizados** em:
- `lead_id`, `event_id` nas tabelas de relacionamento
- `interaction_date` em interações
- `sale_date`, `payment_status` em vendas
- `expected_payment_date` em vendas

**Triggers Automáticos**:
- Atualização automática de `updated_at` em todas as tabelas

---

## 🎨 Design System

### Tema e Cores

O sistema usa um **design premium e profissional** com:

- 🟡 **Gold** (`#F2C94C`) - Cor principal (branding)
- 🟢 **Success/Green** (`#27AE60`) - Positivo, crescimento
- 🔵 **Info/Blue** (`#3498DB`) - Informação, neutro
- 🟣 **Purple** - Secundário, destaque
- 🔴 **Destructive/Red** - Negativo, alertas

### Componentes UI

**Base**: shadcn/ui + Radix UI
- Cards premium com animações
- Modais/Dialogs
- Forms com validação
- Tabelas sortáveis
- Gráficos interativos
- Tooltips
- Toasts/Notificações

---

## 🚀 Rotas da Aplicação

| Rota | Componente | Descrição | Proteção |
|------|-----------|-----------|----------|
| `/` | Index | Dashboard Executivo | ✅ Protected |
| `/auth` | ModernAuth | Login/Registro | 🔓 Public |
| `/leads` | Leads | Gestão de Leads | ✅ Protected |
| `/eventos` | Events | Gestão de Eventos | ✅ Protected |
| `/vendas` | Sales | Gestão de Vendas | ✅ Protected |
| `/produtos` | Products | Catálogo de Produtos | ✅ Protected |
| `/caixa` | CashFlow | Fluxo de Caixa | ✅ Protected |
| `/exportar` | Export | Exportação de Dados | ✅ Protected |
| `/usuarios` | UserManagement | Gestão de Usuários | ✅ Protected |
| `*` | NotFound | Página 404 | - |

---

## 👥 Sistema de Permissões (Roles)

### Roles Disponíveis:

1. **👑 Admin** (Administrador)
   - Acesso total ao sistema
   - Gerenciar usuários
   - Editar fluxo de caixa
   - Todas as permissões

2. **💼 Vendedor**
   - Gerenciar leads
   - Registrar vendas
   - Adicionar interações
   - Editar fluxo de caixa
   - Visualizar dashboards

3. **👀 Visualizador**
   - Apenas visualização
   - Acesso aos dashboards
   - Sem permissões de edição

**Hook**: `useRoles()` - Controla permissões no frontend

---

## 📊 Dashboards e Analytics

### Executive Dashboard

**8 Cards de Métricas**:
1. Total de Leads
2. Total de Vendas + Ticket Médio
3. Receita Líquida
4. Receita Total
5. Receita em Aberto
6. Ticket Médio
7. Receita Vendida
8. Receita Extra

**5 Visualizações Gráficas**:
1. Pizza: Distribuição de Leads por Fonte
2. Funil: Conversão de Eventos
3. Cards: Métodos de Pagamento
4. Barra: Comparativo Receita (Vendida x Líquida x Aberto)
5. Área: Evolução Mensal (últimos 6 meses)

### Cash Flow Dashboard

**5 Cards de Métricas**:
1. Receita Vendida
2. Receitas Extras
3. A Receber
4. Despesas
5. Saldo do Mês (verde/vermelho)

**3 Visualizações**:
1. Gráfico: Receita Total x Despesa
2. Tabela: Receitas Extras do Mês
3. Tabela: Despesas do Mês

---

## 🔄 Fluxo de Trabalho Típico

### 1️⃣ **Captação de Lead**
- Cadastrar lead no sistema
- Vincular a um evento (opcional)
- Registrar fonte de origem

### 2️⃣ **Gestão do Lead**
- Registrar interações (calls, emails, meetings)
- Atualizar status do lead
- Adicionar próximas ações
- Acompanhar timeline

### 3️⃣ **Evento**
- Criar evento educacional
- Convidar leads
- Marcar presença
- Acompanhar funil de conversão

### 4️⃣ **Venda**
- Registrar venda
- Vincular lead e produto
- Informar valores (vendido, líquido, em aberto)
- Definir datas de pagamento
- Atualizar status de pagamento

### 5️⃣ **Financeiro**
- Acompanhar receitas e despesas
- Registrar receitas extras
- Monitorar saldo mensal
- Exportar dados

### 6️⃣ **Análise**
- Dashboards em tempo real
- Gráficos de conversão
- Métricas de performance
- Exportação de relatórios

---

## 🛠️ Principais Custom Hooks

1. **`useAuth()`** - Autenticação
   - `user` - usuário logado
   - `loading` - estado de carregamento
   - `signOut()` - logout

2. **`useRoles()`** - Permissões
   - `role` - role do usuário
   - `isAdmin` - booleano
   - `canEditCashFlow` - permissão para editar caixa

3. **`useTheme()`** - Tema dark/light

4. **`useToast()`** - Notificações toast

5. **`useMobile()`** - Detecção de dispositivo móvel

---

## 📦 Componentes Principais

### Layouts
- `AppLayout` - Layout padrão com sidebar
- `ModernHeader` - Cabeçalho moderno
- `AppSidebar` - Menu lateral

### Cards e Métricas
- `ModernCard` - Card premium com animações
- `MetricCard` - Card de métrica
- `CustomDashboardCard` - Dashboard customizável

### Tabelas
- `LeadsTable` - Tabela de leads
- `SalesTable` - Tabela de vendas
- `EventsTable` - Tabela de eventos
- `ProductsTable` - Tabela de produtos
- `SortableTableHead` - Cabeçalho sortável

### Dialogs/Modais
- `AddLeadDialog` - Adicionar lead
- `AddEventDialog` - Adicionar evento
- `AddExpenseDialog` - Adicionar despesa
- `AddRevenueDialog` - Adicionar receita
- `AddUserDialog` - Adicionar usuário
- `EditLeadDialog`, `EditEventDialog`, `EditProductDialog`, `EditSaleDialog`
- `LeadDetailsDialog`, `EventDetailsDialog`, `SaleDetailsDialog`

### Formulários
- `AddInteractionForm` - Formulário de interação

### Charts/Gráficos
- `LeadSourceChart` - Pizza de fontes
- `EventConversionFunnel` - Funil de conversão
- `FunnelChart` - Funil genérico
- `EventFunnelChart` - Funil de evento específico
- `LeadStatusChart` / `LeadStatusPieChart` - Status de leads
- `ClientStatusChart` - Status de clientes
- `PaymentMethodsDashboard` - Métodos de pagamento
- `RevenueOverview` - Overview de receitas

### Outros
- `InteractionsTimeline` - Timeline de interações
- `Dashboard` - Dashboard genérico

---

## 🔐 Segurança e Autenticação

### Supabase Auth
- Email/Password authentication
- JWT tokens
- Row Level Security (RLS)
- Políticas de acesso por usuário autenticado

### Frontend Guards
- `ProtectedRoute` - Requer autenticação
- `PublicRoute` - Redireciona se já autenticado
- Role-based permissions via `useRoles()`

---

## 🌐 Responsividade

- Mobile-first design
- Breakpoints Tailwind: `sm`, `md`, `lg`, `xl`, `2xl`
- Sidebar responsiva
- Tabelas com scroll horizontal
- Cards adaptáveis

---

## 📈 Próximos Passos Sugeridos

### Para Desenvolvimento:
1. ✅ Criar novo projeto Supabase
2. ✅ Executar migrations SQL
3. ✅ Atualizar `.env` com novas credenciais
4. ✅ Testar autenticação
5. ✅ Inserir dados de teste
6. ✅ Validar funcionalidades

### Melhorias Futuras Possíveis:
- 📧 Integração com email (SendGrid, etc.)
- 💬 Integração WhatsApp API
- 📱 App mobile (React Native)
- 📊 Relatórios avançados (PDF export)
- 🔔 Sistema de notificações
- 📅 Calendário de eventos
- 🎯 Metas e KPIs
- 🤖 Automações de follow-up

---

## 🎓 Conceitos-Chave do Negócio

### Funil de Conversão (Evento):
```
Lead → Invited → Confirmed → Attended → Negotiation → Purchased
```

### Receitas:
- **Vendida**: Valor total da venda
- **Líquida**: Valor efetivamente recebido
- **Aberto**: Valor ainda a receber
- **Extra**: Receitas adicionais (fora de vendas)

### Status de Lead:
- Lead (inicial)
- Confirmed (confirmado para evento)
- Attended (compareceu)
- Negotiation (em negociação)
- Purchased (comprou)

---

## 📞 Suporte e Documentação

- **Lovable Project**: https://lovable.dev/projects/f1321d7e-c9fd-4770-831a-b1fe59059467
- **Supabase Docs**: https://supabase.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Recharts**: https://recharts.org

---

## 🎨 Identidade Visual

**Nome**: Private Consultancy - Sistema de Gestão

**Paleta de Cores**:
- Gold: `#F2C94C` (principal)
- Success: `#27AE60` (verde)
- Info: `#3498DB` (azul)
- Destructive: `#E74C3C` (vermelho)

**Tipografia**:
- Display: Plus Jakarta Sans
- Body: Inter

---

**Sistema desenvolvido com Lovable.dev** 🚀
