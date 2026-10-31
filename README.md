# Venditus — Gestão para Consultoria & Educação

Aplicação web voltada à gestão de empresas de consultoria e educação, com módulos de CRM, financeiro, eventos e personalização por organização. O projeto usa React e TypeScript no frontend e Supabase para os serviços de backend.

## Funcionalidades e organização

- **CRM e vendas:** gestão de leads, clientes e negócios. A mesa de negócios implementa atualização e exclusão otimistas, com restauração do estado anterior em caso de erro.
- **Financeiro:** telas para fluxo de caixa, receitas, despesas e metas.
- **Eventos:** gestão de participantes e check-in, conforme a documentação do projeto.
- **Personalização:** configuração de cores por organização e alternância entre temas claro e escuro; o contexto de tema aplica variáveis CSS e permite restaurar as cores padrão.
- **Dashboard executivo:** apresentação de indicadores de negócio.

A arquitetura documentada organiza os dados por organização, com políticas RLS no Supabase. Antes de usar o projeto em produção, revise e teste as permissões e o isolamento entre organizações, incluindo as operações administrativas de criação de usuários. A função `create-user` verifica o papel de administrador, mas recebe `organization_id` da requisição e o utiliza com um cliente privilegiado sem comparar explicitamente, nessa função, a organização de destino com a do solicitante.

## Stack

- React, TypeScript e Vite.
- Tailwind CSS e componentes Shadcn/ui.
- Supabase: PostgreSQL, autenticação, armazenamento e Edge Functions.
- TanStack Query para consultas e mutações.
- Tremor e Recharts para visualizações.

## Documentação e desenvolvimento

O [Documentation Hub](./docs/README.md) reúne arquitetura, backend, frontend, permissões e glossário. Para preparar o ambiente, consulte o [guia de desenvolvimento](./docs/DEVELOPMENT.md) e use uma instância de desenvolvimento própria.

O `package.json` declara os scripts `dev`, `build`, `build:dev`, `lint` e `preview`. Não declara um script `test`.

## Contribuição

Entre as contribuições de Guilherme Serafim está o [kanban com atualizações otimistas](https://github.com/GuilhermeSerafim/venditus/commit/341fd02c50043739fd98fe15b603abdbbb81e48e).

---

© 2026 Venditus Inc.
