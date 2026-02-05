# Venditus — Design System & Frontend Spec

> Documentação técnica completa para desenvolvedores.
> Versão: 1.0 | Última atualização: Dezembro 2024

---

## Sumário

1. [Visão Geral](#1-visão-geral)
   - [Stack Tecnológica](#11-stack-tecnológica)
   - [Estrutura de Pastas](#12-estrutura-de-pastas)
   - [Convenções de Nomenclatura](#13-convenções-de-nomenclatura)
2. [Design System (UI/UX)](#2-design-system-uiux)
   - [Tokens de Design](#21-tokens-de-design)
   - [Tipografia](#22-tipografia)
   - [Componentes UI e Estados](#23-componentes-ui-e-estados)
3. [CSS / Tailwind / UI Library](#3-css--tailwind--ui-library)
4. [Responsividade](#4-responsividade)
5. [Ícones e Assets](#5-ícones-e-assets)
6. [Tema Claro e Escuro](#6-tema-claro-e-escuro)
7. [Padrões de Layout por Página](#7-padrões-de-layout-por-página)
8. [Integração com Backend](#8-integração-com-backend)
9. [Checklists e Guias](#9-checklists-e-guias)

---

## 1. Visão Geral

### 1.1 Stack Tecnológica

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Framework** | React | ^18.3.1 |
| **Build Tool** | Vite | Latest |
| **Linguagem** | TypeScript | Strict mode |
| **Estilização** | Tailwind CSS | 3.x |
| **UI Components** | shadcn/ui | Latest |
| **Roteamento** | React Router DOM | ^6.30.1 |
| **Estado/Fetch** | TanStack Query | ^5.83.0 |
| **Backend** | Supabase (Lovable Cloud) | ^2.83.0 |
| **Gráficos** | Recharts | ^2.15.4 |
| **Datas** | date-fns | ^3.6.0 |
| **Ícones** | Lucide React | ^0.462.0 |
| **Formulários** | React Hook Form + Zod | Latest |
| **Toasts** | Sonner + Radix Toast | Latest |

### 1.2 Estrutura de Pastas

```
src/
├── assets/                    # Imagens e logos
│   ├── private-consultancy-logo.png
│   └── seven-logo.jpg
├── components/
│   ├── ui/                    # Componentes base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── badge.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── AppLayout.tsx          # Layout principal com sidebar
│   ├── AppSidebar.tsx         # Navegação lateral
│   ├── TopBar.tsx             # Barra superior minimalista
│   ├── MetricCard.tsx         # Cards de métricas
│   ├── ExecutiveDashboard.tsx # Dashboard executivo
│   ├── LeadsTable.tsx         # Tabela de leads
│   ├── SalesTable.tsx         # Tabela de vendas
│   └── ...
├── hooks/
│   ├── useAuth.tsx            # Autenticação
│   ├── useTheme.tsx           # Tema claro/escuro
│   ├── useRoles.tsx           # Controle de permissões
│   ├── use-toast.ts           # Toast notifications
│   └── use-mobile.tsx         # Detecção mobile
├── integrations/
│   └── supabase/
│       ├── client.ts          # Cliente Supabase (auto-gerado)
│       └── types.ts           # Tipos do banco (auto-gerado)
├── lib/
│   └── utils.ts               # Utilitários (cn function)
├── pages/
│   ├── Index.tsx              # Dashboard
│   ├── Leads.tsx              # Gestão de leads
│   ├── Sales.tsx              # Vendas
│   ├── CashFlow.tsx           # Fluxo de caixa
│   ├── Events.tsx             # Eventos
│   ├── Products.tsx           # Produtos
│   ├── Export.tsx             # Exportação
│   ├── UserManagement.tsx     # Gestão de usuários
│   └── ModernAuth.tsx         # Login/Cadastro
├── index.css                  # Tokens e variáveis CSS
├── App.tsx                    # Rotas e providers
└── main.tsx                   # Entry point
```

### 1.3 Convenções de Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| **Componentes** | PascalCase | `MetricCard.tsx` |
| **Hooks** | camelCase com prefixo `use` | `useAuth.tsx` |
| **Páginas** | PascalCase | `UserManagement.tsx` |
| **Utilitários** | camelCase | `utils.ts` |
| **Variáveis CSS** | kebab-case com prefixo `--` | `--gold-light` |
| **Classes Tailwind** | kebab-case | `premium-card` |
| **Rotas** | lowercase com hífen | `/user-management` |

---

## 2. Design System (UI/UX)

### 2.1 Tokens de Design

#### Cores - Light Theme

| Token | Valor HSL | Uso |
|-------|-----------|-----|
| `--background` | `0 0% 100%` | Fundo principal |
| `--background-subtle` | `0 0% 98%` | Fundo secundário |
| `--foreground` | `0 0% 9%` | Texto principal |
| `--card` | `0 0% 100%` | Fundo dos cards |
| `--card-foreground` | `0 0% 9%` | Texto nos cards |
| `--muted` | `0 0% 96%` | Elementos silenciados |
| `--muted-foreground` | `0 0% 45%` | Texto secundário |
| `--border` | `0 0% 90%` | Bordas |
| `--input` | `0 0% 90%` | Bordas de inputs |

#### Cores - Dark Theme

| Token | Valor HSL | Uso |
|-------|-----------|-----|
| `--background` | `0 0% 5%` | Fundo principal (#0D0D0D) |
| `--background-subtle` | `0 0% 7%` | Fundo secundário |
| `--foreground` | `0 0% 100%` | Texto principal |
| `--card` | `0 0% 8%` | Fundo dos cards (#141414) |
| `--card-foreground` | `0 0% 100%` | Texto nos cards |
| `--muted` | `0 0% 15%` | Elementos silenciados |
| `--muted-foreground` | `0 0% 65%` | Texto secundário |
| `--border` | `0 0% 15%` | Bordas |
| `--input` | `0 0% 15%` | Bordas de inputs |

#### Cores de Marca (Gold Identity)

| Token | Valor HSL | HEX Equivalente | Uso |
|-------|-----------|-----------------|-----|
| `--gold` | `43 74% 49%` | ~#D4A017 | Cor principal da marca |
| `--gold-light` | `45 80% 58%` | ~#E6B85C | Hover/destaque |
| `--gold-dark` | `38 80% 42%` / `40 85% 45%` | ~#C49510 | Variante escura |
| `--gold-muted` | `43 30% 70%` / `43 40% 35%` | Variável | Versão suave |
| `--primary` | `43 74% 49%` | #D4A017 | Ações primárias (= gold) |

#### Cores de Feedback

| Token | Valor HSL | Uso |
|-------|-----------|-----|
| `--success` | `142 71% 45%` | Sucesso (verde) |
| `--warning` | `38 92% 50%` | Alerta (amarelo) |
| `--info` | `217 91% 60%` | Informação (azul) |
| `--error` | `0 84% 60%` | Erro (vermelho) |
| `--destructive` | `0 84% 60%` | Ações destrutivas |

#### Cores de Gráficos

| Token | Valor HSL | Uso |
|-------|-----------|-----|
| `--chart-1` | `217 91% 60%` | Gráfico 1 (azul) |
| `--chart-2` | `142 71% 45%` | Gráfico 2 (verde) |
| `--chart-3` | `262 83% 58%` | Gráfico 3 (roxo) |
| `--chart-4` | `32 95% 55%` | Gráfico 4 (laranja) |
| `--chart-5` | `340 82% 52%` | Gráfico 5 (rosa) |

#### Sidebar Tokens

| Token | Light | Dark |
|-------|-------|------|
| `--sidebar-background` | `0 0% 100%` | `0 0% 6%` |
| `--sidebar-foreground` | `0 0% 9%` | `0 0% 98%` |
| `--sidebar-primary` | `43 74% 49%` | `43 74% 49%` |
| `--sidebar-accent` | `0 0% 96%` | `0 0% 12%` |
| `--sidebar-border` | `0 0% 92%` | `0 0% 12%` |
| `--sidebar-hover` | `43 40% 95%` | `43 74% 49%` |

#### Sombras

```css
/* Light Mode */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.04);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04);
--shadow-gold: 0 8px 30px -8px hsl(43 74% 49% / 0.25);
--shadow-gold-hover: 0 12px 40px -8px hsl(43 74% 49% / 0.35);

/* Dark Mode */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.5);
--shadow-gold: 0 8px 30px -8px hsl(43 74% 49% / 0.3);
--shadow-gold-hover: 0 12px 40px -8px hsl(43 74% 49% / 0.45);
```

#### Border Radius

```css
--radius: 0.625rem; /* 10px - padrão do sistema */

/* Variações no Tailwind */
border-radius-lg: var(--radius);          /* 10px */
border-radius-md: calc(var(--radius) - 2px); /* 8px */
border-radius-sm: calc(var(--radius) - 4px); /* 6px */
```

#### Espaçamentos Padrão

| Classe | Valor | Uso |
|--------|-------|-----|
| `p-4` | 16px | Padding interno de cards |
| `p-5` | 20px | Padding de CardHeader/CardContent |
| `p-6` | 24px | Padding principal de layouts |
| `gap-4` | 16px | Espaço entre cards em grid |
| `gap-6` | 24px | Espaço entre seções |
| `space-y-6` | 24px | Espaço vertical entre elementos |
| `mb-6` | 24px | Margem inferior de headers |

#### Z-Index Layers

| Layer | Z-Index | Uso |
|-------|---------|-----|
| Sidebar | `z-40` | Navegação lateral fixa |
| TopBar | `z-30` | Barra superior sticky |
| Modal/Dialog | `z-50` | Diálogos e modais |
| Toast | `z-[100]` | Notificações toast |
| Dropdown | `z-50` | Menus dropdown |

### 2.2 Tipografia

#### Fontes

```css
/* Corpo do texto */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Títulos e Display */
font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
```

#### Hierarquia

| Elemento | Classe/Estilo | Tamanho | Peso |
|----------|---------------|---------|------|
| **H1** | `text-2xl font-display font-bold tracking-tight` | 24px | 700 |
| **H2** (CardTitle) | `text-lg font-display font-semibold` | 18px | 600 |
| **H3** | `font-display font-semibold` | 16px | 600 |
| **Body** | `text-sm` | 14px | 400 |
| **Small/Label** | `text-xs` | 12px | 500 |
| **Muted** | `text-sm text-muted-foreground` | 14px | 400 |
| **Metric Number** | `.metric-number` | 36px (text-4xl) | 700 |

#### Tracking (Letter Spacing)

```css
/* Títulos */
tracking-tight; /* -0.025em */

/* Labels uppercase */
tracking-wider; /* 0.05em */

/* Table headers */
text-xs uppercase tracking-wider;
```

### 2.3 Componentes UI e Estados

---

#### Button

**Arquivo:** `src/components/ui/button.tsx`

**Variants disponíveis:**

| Variant | Estilo | Uso |
|---------|--------|-----|
| `default` | Fundo gold, texto escuro | Ação primária padrão |
| `gold` | Fundo gold com efeito premium | **Principal - CTAs importantes** |
| `gold-outline` | Borda gold, fundo transparente | Ação secundária gold |
| `destructive` | Vermelho | Ações de exclusão |
| `outline` | Borda gold sutil | Ações secundárias |
| `secondary` | Fundo secundário | Ações terciárias |
| `ghost` | Transparente | Ações em tabelas/toolbars |
| `link` | Texto gold sublinhado | Links textuais |

**Sizes:**

| Size | Classe | Altura | Padding |
|------|--------|--------|---------|
| `default` | `h-10 px-5 py-2` | 40px | 20px horizontal |
| `sm` | `h-9 px-4 text-xs` | 36px | 16px horizontal |
| `lg` | `h-11 px-8` | 44px | 32px horizontal |
| `icon` | `h-10 w-10` | 40px | - |

**Estados:**

- **Hover:** `hover:shadow-gold hover:brightness-110` (gold variant)
- **Active:** `active:scale-[0.98]` - leve redução de escala
- **Focus:** `focus-visible:ring-2 focus-visible:ring-ring`
- **Disabled:** `disabled:opacity-50 disabled:pointer-events-none`

**Exemplo de uso:**

```tsx
// Arquivo: src/pages/Leads.tsx
<Button onClick={() => setAddLeadOpen(true)} variant="gold">
  <Plus className="mr-2 h-4 w-4" />
  Novo Lead
</Button>

// Ghost para ações em tabela
<Button size="sm" variant="ghost" className="text-gold hover:text-gold hover:bg-gold/10">
  <Eye className="h-4 w-4" />
</Button>
```

---

#### Card

**Arquivo:** `src/components/ui/card.tsx`

**Subcomponentes:**

- `Card` - Container principal
- `CardHeader` - Cabeçalho (padding: 20px)
- `CardTitle` - Título (Plus Jakarta Sans, semibold)
- `CardDescription` - Descrição (muted)
- `CardContent` - Conteúdo (padding: 20px, pt: 0)
- `CardFooter` - Rodapé

**Estilos do Card:**

```tsx
// Classes aplicadas
"rounded-xl border border-border/50 bg-card text-card-foreground shadow-sm transition-all duration-300"
"hover:shadow-md dark:border-gold/5 dark:hover:border-gold/10"
```

**Classe especial `.premium-card`:**

```css
.premium-card {
  @apply relative overflow-hidden rounded-xl border bg-card transition-all duration-300;
}

.premium-card::before {
  background: linear-gradient(135deg, hsl(var(--gold) / 0.05), transparent);
}

.premium-card:hover {
  @apply -translate-y-1;
  box-shadow: var(--shadow-gold-hover);
}
```

**Exemplo de uso:**

```tsx
// Arquivo: src/pages/CashFlow.tsx
<Card className="premium-card group">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
      Receita Vendida
    </CardTitle>
    <div className="p-2 rounded-lg bg-gold/10 text-gold group-hover:scale-110 transition-transform">
      <DollarSign className="h-4 w-4" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="metric-number text-gold">R$ 150.000,00</div>
  </CardContent>
</Card>
```

---

#### Input

**Arquivo:** `src/components/ui/input.tsx`

**Estilos:**

```tsx
"flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
"focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold/50"
"dark:focus-visible:ring-gold/40 dark:focus-visible:border-gold/40"
```

**Estados:**

- **Focus:** Anel dourado (gold/50)
- **Disabled:** `opacity-50 cursor-not-allowed`
- **Placeholder:** `text-muted-foreground`

---

#### Select

**Arquivo:** `src/components/ui/select.tsx`

**Componentes:**

- `Select` - Root
- `SelectTrigger` - Botão trigger
- `SelectContent` - Dropdown content
- `SelectItem` - Item individual
- `SelectValue` - Valor selecionado

**Exemplo:**

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Selecione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opcao1">Opção 1</SelectItem>
  </SelectContent>
</Select>
```

---

#### Table

**Arquivo:** `src/components/ui/table.tsx`

**Componentes:**

| Componente | Estilo |
|------------|--------|
| `Table` | Container com borda `border-border/50 dark:border-gold/5` |
| `TableHeader` | Background `bg-muted/30 dark:bg-muted/10` |
| `TableHead` | `h-11 text-xs uppercase tracking-wider font-semibold` |
| `TableRow` | `hover:bg-muted/50 dark:hover:bg-gold/[0.03]` |
| `TableCell` | `p-4` |

**Hover no Dark Mode:**

```css
dark:hover:bg-gold/[0.03] /* Hover dourado sutil */
```

**Exemplo de uso:**

```tsx
// Arquivo: src/components/LeadsTable.tsx
<Table>
  <TableHeader>
    <TableRow className="hover:bg-transparent border-border">
      <SortableTableHead label="Nome" sortKey="name" ... />
    </TableRow>
  </TableHeader>
  <TableBody>
    {leads?.map((lead) => (
      <TableRow key={lead.id} className="border-border">
        <TableCell className="font-medium text-foreground">{lead.name}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

#### Badge

**Arquivo:** `src/components/ui/badge.tsx`

**Variants:**

| Variant | Estilo |
|---------|--------|
| `default` | Fundo primary, texto primary-foreground |
| `secondary` | Fundo secondary |
| `destructive` | Fundo vermelho |
| `outline` | Apenas borda |

**Estilo base:**

```tsx
"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
```

---

#### Dialog/Modal

**Arquivo:** `src/components/ui/dialog.tsx`

**Overlay:**

```tsx
"fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
```

**Content:**

```tsx
"fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]"
"border border-border/50 bg-card p-6 shadow-xl sm:rounded-xl"
```

**Animações:**

- Entrada: `fade-in-0 zoom-in-95 slide-in-from-top-[48%]`
- Saída: `fade-out-0 zoom-out-95 slide-out-to-top-[48%]`

---

#### Toast/Sonner

**Arquivo:** `src/components/ui/toast.tsx`

**Variants:**

- `default`: Borda e fundo padrão
- `destructive`: Fundo vermelho para erros

**Posição:** Bottom-right em desktop, top em mobile

---

#### Skeleton

**Arquivo:** `src/components/ui/skeleton.tsx`

```tsx
<Skeleton className="h-4 w-[250px]" />
```

Estilo: `animate-pulse rounded-md bg-muted`

---

## 3. CSS / Tailwind / UI Library

### Confirmação de Stack

- ✅ **Tailwind CSS** - Configurado com tokens customizados
- ✅ **shadcn/ui** - Componentes base (Radix primitives + Tailwind)
- ✅ **CSS Variables** - Tokens em `src/index.css`
- ❌ CSS Modules - Não utilizado
- ❌ styled-components - Não utilizado

### tailwind.config.ts

```typescript
// Arquivo: tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
          dark: "hsl(var(--gold-dark))",
          muted: "hsl(var(--gold-muted))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        error: "hsl(var(--error))",
        // ... outros tokens
      },
      boxShadow: {
        'gold': 'var(--shadow-gold)',
        'gold-hover': 'var(--shadow-gold-hover)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "card-hover": "card-hover 0.3s ease-out forwards",
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### Função `cn()` para composição de classes

**Arquivo:** `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Uso:**

```tsx
<Card className={cn(
  "premium-card group cursor-default",
  "border-border/50 dark:border-gold/5 dark:bg-gradient-to-br dark:from-card dark:to-card/80"
)}>
```

### Classes Utilitárias Customizadas

Definidas em `src/index.css`:

| Classe | Uso |
|--------|-----|
| `.premium-card` | Card com efeito hover gold |
| `.table-row-premium` | Row com hover gold sutil |
| `.sidebar-active-indicator` | Linha vertical dourada |
| `.btn-premium` | Botão com efeito de brilho |
| `.metric-number` | Números grandes animados |
| `.bg-gradient-radial-light` | Background com gradiente radial |
| `.bg-gradient-radial-dark` | Background dark com gradiente gold |
| `.modal-blur` | Backdrop blur para modais |
| `.icon-click-scale` | Scale 1.05 ao clicar ícone |
| `.border-gold-glow` | Borda gold sutil |
| `.focus-gold` | Focus ring gold |

### Plugins Ativos

```javascript
plugins: [require("tailwindcss-animate")]
```

Fornece animações como `animate-in`, `animate-out`, `fade-in-0`, `zoom-in-95`, etc.

---

## 4. Responsividade

### Breakpoints

Utilizamos os breakpoints padrão do Tailwind:

| Breakpoint | Largura Mínima | Classe |
|------------|----------------|--------|
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1400px | `2xl:` (container) |

### Padrões de Grid

**Dashboard Cards:**

```tsx
// Arquivo: src/components/ExecutiveDashboard.tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* 1 coluna mobile, 2 tablet, 4 desktop */}
</div>
```

**Grids lado a lado:**

```tsx
<div className="grid gap-6 lg:grid-cols-2">
  {/* 1 coluna até lg, depois 2 */}
</div>
```

### Sidebar Responsiva

```tsx
// Arquivo: src/components/AppSidebar.tsx
className={cn(
  "fixed left-0 top-0 z-40 h-screen transition-all duration-300",
  isCollapsed ? "w-[68px]" : "w-[240px]"
)}
```

- **Colapsada:** 68px (apenas ícones)
- **Expandida:** 240px (ícones + labels)
- **Expansão:** Hover automático

### Conteúdo Principal

```tsx
// Arquivo: src/components/AppLayout.tsx
<div className="pl-[68px] min-h-screen transition-all duration-300">
  {/* Padding-left fixa para acomodar sidebar colapsada */}
</div>
```

### TopBar Responsiva

```tsx
// Arquivo: src/components/TopBar.tsx
<div className="hidden sm:flex flex-col items-end">
  {/* Nome do usuário só aparece em sm+ */}
</div>
```

### Tabelas em Mobile

As tabelas usam `overflow-auto` no container:

```tsx
<div className="relative w-full overflow-auto rounded-xl border">
  <table>...</table>
</div>
```

### Guia: Criar Telas Responsivas

1. **Mobile-first:** Sempre comece sem breakpoint
2. **Use grid com breakpoints:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
3. **Oculte elementos secundários em mobile:** `hidden sm:flex`
4. **Ajuste paddings:** `px-4 md:px-6`
5. **Teste em todos os breakpoints**

---

## 5. Ícones e Assets

### Biblioteca de Ícones

**Lucide React** (`lucide-react` ^0.462.0)

### Padrão de Tamanhos

| Contexto | Tamanho | Classe |
|----------|---------|--------|
| Sidebar | 20px | `h-5 w-5` |
| Botões | 16px | `h-4 w-4` |
| TopBar | 18px | `h-[18px] w-[18px]` |
| Cards (ícone de ação) | 16px | `h-4 w-4` |
| Métricas (fundo) | 16px-20px | `h-4 w-4` ou `h-5 w-5` |

### Padrão de Cores

```tsx
// Ícone gold
<Icon className="text-gold" />

// Ícone muted
<Icon className="text-muted-foreground" />

// Com background
<div className="p-2 rounded-lg bg-gold/10 text-gold">
  <Icon className="h-4 w-4" />
</div>
```

### Importação

```tsx
import { 
  LayoutDashboard, 
  Wallet, 
  Users, 
  Calendar, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Moon,
  Sun,
  LogOut,
  Bell
} from "lucide-react";
```

### Ícones mais usados no sistema

| Ícone | Uso |
|-------|-----|
| `LayoutDashboard` | Menu Dashboard |
| `Wallet` | Menu Caixa |
| `TrendingUp` | Menu Vendas / Receita |
| `Users` | Menu Leads |
| `Calendar` | Menu Eventos |
| `Package` | Menu Produtos |
| `FileText` | Menu Exportar |
| `UserCog` | Menu Usuários |
| `Plus` | Botão adicionar |
| `Edit` | Editar registro |
| `Trash2` | Excluir registro |
| `Eye` | Visualizar detalhes |
| `Moon` / `Sun` | Toggle de tema |
| `LogOut` | Sair |
| `Bell` | Notificações |
| `DollarSign` | Valores monetários |

### Logos e Imagens

| Asset | Caminho | Dimensões |
|-------|---------|-----------|
| Logo principal | `src/assets/private-consultancy-logo.png` | Variável |
| Favicon | `public/favicon.png` | 32x32 |

**Importação de logos:**

```tsx
import privateConsultancyLogo from "@/assets/private-consultancy-logo.png";

<img 
  src={privateConsultancyLogo} 
  alt="Private Consultancy" 
  className="h-9 w-9 object-cover"
/>
```

---

## 6. Tema Claro e Escuro

### Implementação

**Arquivo:** `src/hooks/useTheme.tsx`

```tsx
type Theme = "light" | "dark";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("seven-theme");
    return (stored as Theme) || "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("seven-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Mecanismo

1. **Classe no HTML:** `<html class="dark">` ou `<html class="light">`
2. **Persistência:** `localStorage.setItem("seven-theme", theme)`
3. **CSS Variables:** Mudam baseado na classe `.dark`

### Botão de Toggle

```tsx
// Arquivo: src/components/TopBar.tsx
<Button variant="ghost" size="icon" onClick={toggleTheme}>
  {theme === "light" ? <Moon /> : <Sun />}
</Button>
```

### Tokens que Mudam

Todos os tokens definidos em `:root` e `.dark` no `index.css`:

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--muted`, `--muted-foreground`
- `--border`, `--input`
- Todas as sombras (`--shadow-*`)
- Tokens da sidebar

### Checklist: Componente Compatível com Temas

1. ✅ **Nunca usar cores hardcoded** (`text-white`, `bg-black`)
2. ✅ **Sempre usar tokens:** `text-foreground`, `bg-card`
3. ✅ **Para variações, usar `dark:`:** `dark:border-gold/5`
4. ✅ **Testar em ambos os modos**
5. ✅ **Verificar contraste de texto**

---

## 7. Padrões de Layout por Página

### Estrutura Comum

Todas as páginas usam o `AppLayout`:

```tsx
<AppLayout 
  title="Título da Página" 
  description="Descrição opcional"
  actions={<Button>CTA Principal</Button>}
>
  {/* Conteúdo da página */}
</AppLayout>
```

### Dashboard (Index)

**Arquivo:** `src/pages/Index.tsx`

```tsx
<AppLayout title="Dashboard Executivo" description="Visão geral do seu negócio em tempo real">
  <ExecutiveDashboard />
</AppLayout>
```

**Estrutura:**
- Grid de 8 MetricCards (4 principais + 4 secundários)
- Grid 2 colunas: LeadSourceChart + EventConversionFunnel
- PaymentMethodsDashboard
- Grid 2 colunas: BarChart + AreaChart

**Estados:**
- Loading: Componentes carregam individualmente via React Query
- Vazio: Mensagens "Nenhum dado" em cada componente

---

### Leads

**Arquivo:** `src/pages/Leads.tsx`

```tsx
<AppLayout 
  title="Gestão de Leads" 
  description="Gerencie todos os seus leads e contatos"
  actions={canEditLeads && <Button variant="gold"><Plus /> Novo Lead</Button>}
>
  <LeadsTable />
  <AddLeadDialog ... />
</AppLayout>
```

**CTA:** Botão "Novo Lead" (condicional por permissão)

**Tabela:** Sortable com colunas Nome, Email, Telefone, Origem, Ações

**Ações:** Eye (ver), Edit (editar), Trash2 (excluir)

---

### Vendas

**Arquivo:** `src/pages/Sales.tsx`

```tsx
<AppLayout title="Gestão de Vendas" description="Acompanhe todas as suas vendas e pagamentos">
  <SalesTable />
</AppLayout>
```

---

### Caixa (CashFlow)

**Arquivo:** `src/pages/CashFlow.tsx`

```tsx
<AppLayout 
  title="Fluxo de Caixa" 
  description={format(new Date(), "MMMM 'de' yyyy")}
  actions={canEditCashFlow && (
    <div className="flex gap-2">
      <Button className="bg-success">Nova Receita</Button>
      <Button variant="gold">Nova Despesa</Button>
    </div>
  )}
>
  {/* 5 cards de métricas */}
  {/* Gráfico de barras */}
  {/* Grid 2 colunas: Receitas + Despesas */}
</AppLayout>
```

**Cards:** Receita Vendida, Receitas Extras, A Receber, Despesas, Saldo

---

### Eventos, Produtos, Export, UserManagement

Seguem o mesmo padrão:
- `AppLayout` com título e description
- CTA condicional por permissão
- Tabela ou conteúdo específico

---

## 8. Integração com Backend

### Cliente Supabase

**Arquivo:** `src/integrations/supabase/client.ts` (auto-gerado)

```tsx
import { supabase } from "@/integrations/supabase/client";
```

### Padrão de Queries (TanStack Query)

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ["leads"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
```

### Padrão de Mutations

```tsx
const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    toast({ title: "Lead excluído com sucesso" });
  },
  onError: () => {
    toast({ title: "Erro ao excluir lead", variant: "destructive" });
  },
});
```

### Tratamento de Loading

```tsx
if (isLoading) {
  return <div className="text-center py-8">Carregando...</div>;
}
```

### Tratamento de Empty State

```tsx
{(!leads || leads.length === 0) && (
  <TableRow>
    <TableCell colSpan={4} className="text-center text-muted-foreground">
      Nenhum lead cadastrado
    </TableCell>
  </TableRow>
)}
```

### Tipagens (TypeScript)

**Arquivo:** `src/integrations/supabase/types.ts` (auto-gerado)

```typescript
export type Tables<T extends keyof Database["public"]["Tables"]> = 
  Database["public"]["Tables"][T]["Row"];

// Uso
type Lead = Tables<"leads">;
```

### Edge Functions

**Diretório:** `supabase/functions/`

```typescript
// supabase/functions/delete-user/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Lógica da function
});
```

---

## 9. Checklists e Guias

### Como Criar uma Nova Página

1. **Criar arquivo em `src/pages/`:**
   ```tsx
   // src/pages/NovaPagina.tsx
   import { AppLayout } from "@/components/AppLayout";

   const NovaPagina = () => {
     return (
       <AppLayout 
         title="Título da Página" 
         description="Descrição"
         actions={<Button variant="gold">CTA</Button>}
       >
         <div>Conteúdo</div>
       </AppLayout>
     );
   };

   export default NovaPagina;
   ```

2. **Adicionar rota em `src/App.tsx`:**
   ```tsx
   <Route
     path="/nova-pagina"
     element={
       <ProtectedRoute>
         <NovaPagina />
       </ProtectedRoute>
     }
   />
   ```

3. **Adicionar no menu (`src/components/AppSidebar.tsx`):**
   ```tsx
   { to: "/nova-pagina", icon: <Icon />, label: "Nova Página", show: canAccess }
   ```

4. **Implementar permissões em `useRoles.tsx` se necessário**

---

### Como Criar um Novo Componente

1. **Criar arquivo em `src/components/`:**
   ```tsx
   // src/components/MeuComponente.tsx
   import { cn } from "@/lib/utils";

   interface MeuComponenteProps {
     title: string;
     className?: string;
   }

   export const MeuComponente = ({ title, className }: MeuComponenteProps) => {
     return (
       <div className={cn(
         "rounded-xl border border-border bg-card p-4",
         "dark:border-gold/5",
         className
       )}>
         <h3 className="text-lg font-display font-semibold">{title}</h3>
       </div>
     );
   };
   ```

2. **Sempre usar:**
   - `cn()` para composição de classes
   - Tokens do design system (nunca cores hardcoded)
   - Props tipadas com TypeScript
   - Classes `dark:` para variações de tema

---

### Do's and Don'ts

#### ✅ DO's

| Prática | Exemplo |
|---------|---------|
| Usar tokens de cor | `text-foreground`, `bg-card` |
| Usar `cn()` para classes | `cn("base", conditional && "active")` |
| Usar shadcn components | `<Button>`, `<Card>`, `<Table>` |
| Criar variantes em `cva()` | Ver `button.tsx` |
| Usar React Query para data | `useQuery`, `useMutation` |
| Tratar loading/empty states | Loading spinner, mensagem vazia |
| Usar Lucide para ícones | `import { Icon } from "lucide-react"` |
| Testar em light e dark mode | Sempre ambos |
| Usar AppLayout para páginas | Consistência de layout |

#### ❌ DON'Ts

| Evitar | Alternativa |
|--------|-------------|
| `text-white`, `bg-black` | `text-foreground`, `bg-background` |
| `#FFD700` direto | `hsl(var(--gold))` ou `text-gold` |
| CSS inline | Tailwind classes |
| Fetch direto | React Query |
| Componentes sem TypeScript | Sempre tipar props |
| Hardcode de textos longos | Considerar i18n futuro |
| Editar `client.ts` ou `types.ts` | São auto-gerados |
| Z-index aleatórios | Usar padrão (30, 40, 50, 100) |

---

### Melhorias Técnicas Recomendadas

1. **Skeleton Loading:**
   - Implementar `<Skeleton>` durante carregamento em vez de texto "Carregando..."

2. **Error Boundaries:**
   - Adicionar error boundaries para captura de erros de renderização

3. **Lazy Loading:**
   - Implementar `React.lazy()` para rotas e componentes pesados

4. **Acessibilidade:**
   - Adicionar `aria-labels` em todos os botões de ícone
   - Verificar contraste de cores (WCAG)

5. **Testes:**
   - Adicionar testes unitários para hooks
   - Testes de integração para fluxos críticos

6. **Performance:**
   - Memoização com `useMemo`/`useCallback` em listas grandes
   - Virtualização para tabelas com muitos registros

7. **SEO:**
   - Adicionar meta tags dinâmicas por página
   - Implementar structured data

8. **PWA:**
   - Adicionar manifest.json
   - Implementar service worker para cache

---

## Apêndice: Referência Rápida de Classes

```css
/* Backgrounds */
bg-background          /* Fundo principal */
bg-card                /* Fundo de cards */
bg-muted               /* Fundo silenciado */
bg-gold/10             /* Fundo gold com opacidade */

/* Texto */
text-foreground        /* Texto principal */
text-muted-foreground  /* Texto secundário */
text-gold              /* Texto dourado */

/* Bordas */
border-border          /* Borda padrão */
border-border/50       /* Borda com opacidade */
dark:border-gold/5     /* Borda gold sutil no dark */

/* Sombras */
shadow-sm              /* Sombra pequena */
shadow-gold            /* Sombra dourada */
shadow-gold-hover      /* Sombra dourada hover */

/* Animações */
animate-fade-in        /* Fade in */
animate-slide-up       /* Slide up */
animate-pulse-gold     /* Pulse dourado */
transition-all duration-300  /* Transição suave */

/* Layout */
rounded-xl             /* Border radius 10px */
p-5                    /* Padding 20px */
gap-4                  /* Gap 16px */
```

---

**Documento mantido por:** Equipe de Desenvolvimento Private Consultancy  
**Última revisão:** Dezembro 2024
