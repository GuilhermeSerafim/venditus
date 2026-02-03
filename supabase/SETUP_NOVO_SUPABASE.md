# 🚀 Guia Completo: Configurando Novo Supabase

## 📋 O que você precisa fazer

### 1️⃣ Criar o Novo Projeto Supabase

1. Acesse: https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `huil-educacional` (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)
4. Clique em **"Create new project"** e aguarde ~2 minutos

### 2️⃣ Coletar as Credenciais

Após o projeto ser criado, vá em **Settings** → **API**:

Você precisará de:
- ✅ **Project URL** (algo como: `https://xxx.supabase.co`)
- ✅ **Project ID** (o código antes de `.supabase.co`)
- ✅ **anon/public key** (chave pública longa)

### 3️⃣ Atualizar o arquivo `.env`

Substitua as variáveis no arquivo `.env` do projeto com os novos valores:

```env
VITE_SUPABASE_PROJECT_ID="SEU_PROJECT_ID_AQUI"
VITE_SUPABASE_PUBLISHABLE_KEY="SUA_ANON_KEY_AQUI"
VITE_SUPABASE_URL="https://SEU_PROJECT_ID.supabase.co"
```

### 4️⃣ Executar as Migrations SQL

No dashboard do Supabase:

1. Vá em **SQL Editor** (ícone 📝 no menu lateral)
2. Clique em **"New query"**
3. Execute os SQLs **NA ORDEM** abaixo:

#### **Passo 1: Migration Principal** ✨
```sql
-- Cole todo o conteúdo do arquivo:
-- supabase/migrations/20251126203502_remix_migration_from_pg_dump.sql
```
> Este arquivo cria todas as tabelas principais do sistema

#### **Passo 2: Migrations Adicionais** 🔧
Execute cada arquivo na pasta `supabase/migrations/` em ordem cronológica (pelo timestamp no nome).

São 18 arquivos, executar na ordem:
1. `20251126203502_remix_migration_from_pg_dump.sql` ✅ (já executado acima)
2. `20251126205001_013caad5-0361-4959-9bcf-ac2991c4d919.sql`
3. `20251126205734_d23c0d90-fcac-4838-8c02-04ad002463c0.sql`
4. `20251126231921_20b33a19-cc37-4faf-8f1d-2c2b1f7839c8.sql`
5. `20251127162041_19eaece6-a44c-4f44-8dd2-1eb3ce505c29.sql`
6. `20251127181637_51aa0bf6-6912-4d20-87ca-d08e968044fc.sql`
7. `20251127191312_87ba676d-cb69-476c-835d-be6e67a3e6ca.sql`
8. `20251127193017_fea28382-b68e-4305-9915-33d45c0f74a2.sql`
9. `20251127200522_67838900-698b-402e-ab75-4931f52d6d69.sql`
10. `20251201134959_09514f0f-53a0-4fbe-bee0-d335940ba567.sql`
11. `20251201142920_4ee3b91a-f314-424c-83e6-e1508eaba162.sql`
12. `20251201143229_9e462b7f-0d9a-491b-8308-8968c82f23a8.sql`
13. `20251201143944_d4d48296-569c-4034-bd47-53f3fdf8e290.sql`
14. `20251201144142_3669cb9f-c714-48aa-adcc-b266bce0b2c1.sql`
15. `20251201152057_fb29ee79-ae01-4484-9edc-a65773bb92f5.sql`
16. `20251201152142_5590d48a-b450-4e12-bdb6-c25f00d0ec7e.sql`
17. `20251201163947_23de7579-c3e6-45b9-8228-9de06b1aec25.sql`
18. `20251204213221_d7c03379-d4c0-4365-90ca-4d7d71f969a9.sql`

#### **Passo 3: Políticas de Dashboards Customizados** 🔒
```sql
-- Cole todo o conteúdo do arquivo:
-- supabase/MANUAL_MIGRATION_custom_dashboards_policies.sql
```

### 5️⃣ Configurar Autenticação (Opcional mas Recomendado)

No dashboard do Supabase, vá em **Authentication** → **Providers**:

- ✅ **Email**: Já vem habilitado por padrão
- Configure outros providers se desejar (Google, GitHub, etc.)

### 6️⃣ Testar a Conexão

Após atualizar o `.env` e executar as migrations:

1. Reinicie o servidor de desenvolvimento:
   ```bash
   # Pare o servidor atual (Ctrl+C)
   npm run dev
   ```

2. Teste o sistema:
   - Crie uma conta de usuário
   - Faça login
   - Teste as funcionalidades principais

---

## 🗂️ Estrutura do Banco de Dados

### Tabelas Principais:

#### 📅 **events** - Eventos
Gerencia eventos educacionais e suas capacidades.

#### 👥 **leads** - Leads/Contatos
Armazena informações de potenciais clientes.

#### 🔗 **lead_events** - Relacionamento Lead-Evento
Conecta leads aos eventos (muitos-para-muitos).

#### 💬 **interactions** - Interações
Registra todas as interações com os leads (calls, emails, meetings, etc.).

#### 📦 **products** - Produtos
Catálogo de produtos/serviços oferecidos.

#### 💰 **sales** - Vendas
Registra vendas realizadas com informações de pagamento.

---

## 🔒 Segurança (RLS - Row Level Security)

Todas as tabelas têm **Row Level Security** habilitado com políticas que permitem:
- ✅ Apenas usuários autenticados podem ver/editar dados
- ✅ Proteção contra acessos não autorizados
- ✅ Triggers automáticos para `updated_at`

---

## ✅ Checklist Final

- [ ] Criar novo projeto no Supabase
- [ ] Copiar Project URL, ID e anon key
- [ ] Atualizar arquivo `.env`
- [ ] Executar migration principal (passo 1)
- [ ] Executar todas as migrations adicionais em ordem (passos 2)
- [ ] Executar políticas de dashboards (passo 3)
- [ ] Configurar autenticação (se necessário)
- [ ] Reiniciar servidor dev
- [ ] Testar login e funcionalidades

---

## 🆘 Troubleshooting

### Erro ao executar SQL:
- Verifique se está executando **na ordem correta**
- Algumas migrations dependem de outras anteriores

### Aplicação não conecta:
- Verifique se o `.env` está correto
- Reinicie o servidor dev (`Ctrl+C` e `npm run dev`)
- Limpe o cache do navegador

### Dados não aparecem:
- Verifique se você está autenticado
- RLS está ativo - precisa estar logado para ver dados
- Crie um usuário via Supabase → Authentication → Users

---

## 💡 Dicas

- Guarde a senha do banco em local seguro
- A **anon key** pode ser pública (já está no código frontend)
- Nunca compartilhe a **service_role key** (tem acesso total)
- Faça backup regular do banco via Supabase dashboard

---

**Está tudo pronto!** 🎉 Me avise quando tiver as credenciais que eu te ajudo a atualizar o `.env`!
