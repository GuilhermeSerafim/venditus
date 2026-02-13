# Guia de Perfis e Permissões - Venditus

Este documento define as responsabilidades e níveis de acesso de cada perfil de usuário dentro do ecossistema Venditus. O sistema utiliza RLS (Row Level Security) para garantir que cada usuário acesse apenas o que lhe é permitido.

## 1. Administrador (Admin)
**Papel:** Gestor Estratégico do Tenant.

*   **Responsabilidades:**
    *   Configurar regras de pontuação e penalidades do Social Selling Game.
    *   Gerenciar a identidade visual (White-Label) da organização.
    *   Gerenciar usuários e acessos da equipe.
*   **Permissões:**
    *   Acesso total (Leitura/Escrita) a todos os módulos.
    *   Acesso exclusivo ao painel de Configurações (Settings).

## 2. Consultor de Vendas (Comercial)
**Papel:** Usuário ativo do Social Selling e Motor de Receita.

*   **Responsabilidades:**
    *   Gerenciar Leads e Oportunidades na Mesa de Negócios.
    *   Produzir conteúdo e interagir no LinkedIn para acumular pontos.
    *   Registrar interações (calls, reuniões) para manter o CRM atualizado.
*   **Permissões:**
    *   Leitura/Escrita em: Leads, Vendas, Interações, Eventos.
    *   **Gamificação:** Visualiza seu próprio ranking e pontuação.

## 3. Gestor Financeiro (Financeiro)
**Papel:** Guardião do ERP e Validador de Receita.

*   **Responsabilidades:**
    *   Validar o faturamento proveniente da Mesa de Negócios.
    *   Gerenciar Fluxo de Caixa (Receitas e Despesas).
    *   Realizar conciliação bancária e controle de inadimplência.
*   **Permissões:**
    *   Acesso total ao módulo Financeiro (Fluxo de Caixa).
    *   Visualização da Mesa de Negócios (para conferência de valores).
    *   *Sem permissão para alterar regras de gamificação ou leads.*

## 4. Auditor (Somente Leitura)
**Papel:** Observador Externo ou Stakeholder.

*   **Responsabilidades:**
    *   Acompanhar a performance geral através de Dashboards.
    *   Auditar números macro do negócio.
*   **Permissões:**
    *   **Acesso Restrito:** Apenas visualização de Dashboards de KPI.
    *   **Confidencialidade:** **NÃO** visualiza detalhes sensíveis da Mesa de Negócios (nomes de leads, negociações específicas).
