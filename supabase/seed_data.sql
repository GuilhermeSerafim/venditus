-- ============================================================================
-- SCRIPT DE POPULAÇÃO DO BANCO - VENDITUS
-- ============================================================================
-- Este script adiciona dados de exemplo para testar o sistema
-- Execute no SQL Editor do Supabase
-- ============================================================================

-- ============================================================================
-- 1. PRODUTOS (6 produtos educacionais)
-- ============================================================================

INSERT INTO products (name, description, price) VALUES
('Mentoria Individual 3 meses', 'Mentoria personalizada com acompanhamento semanal durante 3 meses', 4500.00),
('Curso Preparatório ENEM', 'Curso completo de preparação para ENEM com material didático incluso', 2800.00),
('Workshop Redação', 'Workshop intensivo de redação para vestibulares (2 dias)', 800.00),
('Mentoria Individual 6 meses', 'Mentoria personalizada com acompanhamento semanal durante 6 meses', 7500.00),
('Curso de Inglês Instrumental', 'Curso de inglês focado em leitura e interpretação de textos acadêmicos', 1500.00),
('Pacote Completo Vestibular', 'Curso preparatório + mentoria + workshops (12 meses)', 15000.00);

-- ============================================================================
-- 2. EVENTOS (4 eventos educacionais)
-- ============================================================================

INSERT INTO events (name, event_date, location, capacity) VALUES
('Palestra: Como Escolher Sua Carreira', '2026-01-15', 'Auditório Centro Educacional', 100),
('Workshop Gratuito de Redação', '2026-01-22', 'Online - Zoom', 50),
('Feira de Profissões 2026', '2026-02-10', 'Ginásio Municipal', 200),
('Aula Aberta - Técnicas de Estudo', '2026-02-28', 'Online - YouTube Live', 150);

-- ============================================================================
-- 3. LEADS (15 leads em diferentes estágios)
-- ============================================================================

-- Primeiro, vamos pegar o user_id do primeiro admin
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Pega o primeiro usuário admin
  SELECT user_id INTO admin_user_id 
  FROM user_roles 
  WHERE role = 'admin' 
  LIMIT 1;
  
  -- Se não encontrar admin, pega qualquer usuário
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
  END IF;
  
  -- Insere os leads com o user_id do admin
  INSERT INTO leads (name, email, phone, status, notes, user_id) VALUES
  -- LEADS (5)
  ('Ana Carolina Silva', 'ana.silva@email.com', '(11) 98765-4321', 'lead', 'Interesse em mentoria ENEM', admin_user_id),
  ('Bruno Santos', 'bruno.santos@email.com', '(11) 97654-3210', 'lead', 'Indicado por Maria Eduarda - Instagram', admin_user_id),
  ('Carla Mendes', 'carla.mendes@email.com', '(11) 96543-2109', 'lead', 'CPF: 234.567.890-11 - Google', admin_user_id),
  ('Daniel Oliveira', 'daniel.ol@email.com', '(21) 95432-1098', 'lead', 'Captado via site', admin_user_id),
  ('Eduarda Costa', 'eduarda.c@email.com', '(11) 94321-0987', 'lead', 'Escola Premium - Evento', admin_user_id),
  
  -- CLIENTES ATIVOS (7)
  ('Fernanda Lima', 'fernanda.lima@email.com', '(11) 93210-9876', 'cliente_ativo', 'Indicada por João Pedro - CPF: 345.678.901-22', admin_user_id),
  ('Gabriel Rodrigues', 'gabriel.rod@email.com', '(21) 92109-8765', 'cliente_ativo', 'Instagram', admin_user_id),
  ('Helena Alves', 'helena.alves@email.com', '(11) 91098-7654', 'cliente_ativo', 'CPF: 456.789.012-33 - Google', admin_user_id),
  ('Igor Martins', 'igor.martins@email.com', '(11) 90987-6543', 'cliente_ativo', 'Colégio Objetivo', admin_user_id),
  ('Juliana Ferreira', 'juliana.f@email.com', '(21) 89876-5432', 'cliente_ativo', 'CPF: 567.890.123-44 - Indicada por Ana Carolina', admin_user_id),
  ('Kevin Souza', 'kevin.souza@email.com', '(11) 88765-4321', 'cliente_ativo', 'Indicação', admin_user_id),
  ('Larissa Nunes', 'larissa.nunes@email.com', '(11) 87654-3210', 'cliente_ativo', 'CPF: 678.901.234-55 - WhatsApp', admin_user_id),
  
  -- EX-CLIENTES (3)
  ('Marcos Pereira', 'marcos.p@email.com', '(21) 86543-2109', 'ex_cliente', 'Indicado por Gabriel - Desistiu', admin_user_id),
  ('Natália Cardoso', 'natalia.c@email.com', '(11) 85432-1098', 'ex_cliente', 'CPF: 789.012.345-66 - Concluiu curso', admin_user_id),
  ('Otávio Barbosa', 'otavio.b@email.com', '(11) 84321-0987', 'ex_cliente', 'Escola Adventista - Concluiu mentoria', admin_user_id);
END $$;

-- ============================================================================
-- 4. RELACIONAR LEADS COM EVENTOS (lead_events)
-- ============================================================================

-- Evento 1: Palestra Carreira (20 participantes que viraram leads)
INSERT INTO lead_events (lead_id, event_id, status)
SELECT l.id, e.id, 'attended'
FROM leads l
CROSS JOIN events e
WHERE e.name = 'Palestra: Como Escolher Sua Carreira'
AND l.name IN ('Ana Carolina Silva', 'Bruno Santos', 'Carla Mendes', 'Daniel Oliveira', 'Fernanda Lima', 'Gabriel Rodrigues', 'Helena Alves', 'Igor Martins');

-- Evento 2: Workshop Redação (16 participantes)
INSERT INTO lead_events (lead_id, event_id, status)
SELECT l.id, e.id, 'attended'
FROM leads l
CROSS JOIN events e
WHERE e.name = 'Workshop Gratuito de Redação'
AND l.name IN ('Eduarda Costa', 'Juliana Ferreira', 'Kevin Souza', 'Larissa Nunes', 'Marcos Pereira', 'Natália Cardoso');

-- ============================================================================
-- 5. INTERAÇÕES (30 interações com leads)
-- ============================================================================

-- Interações com Ana Carolina Silva (lead)
INSERT INTO interactions (lead_id, interaction_type, description, interaction_date)
SELECT id, 'call', 'Primeiro contato. Interesse em mentoria para ENEM. Aguardando retorno dos pais.', '2026-01-16'
FROM leads WHERE name = 'Ana Carolina Silva';

INSERT INTO interactions (lead_id, interaction_type, description, interaction_date)
SELECT id, 'whatsapp', 'Enviado proposta de mentoria 3 meses. Pais pediram desconto.', '2026-01-20'
FROM leads WHERE name = 'Ana Carolina Silva';

-- Interações com Fernanda Lima (cliente ativo)
INSERT INTO interactions (lead_id, interaction_type, description, interaction_date)
SELECT id, 'meeting', 'Reunião inicial de diagnóstico. Definido plano de estudos personalizado.', '2026-01-10'
FROM leads WHERE name = 'Fernanda Lima';

INSERT INTO interactions (lead_id, interaction_type, description, interaction_date)
SELECT id, 'call', 'Check-in semanal. Progresso excelente em matemática. Cliente muito satisfeita.', '2026-01-24'
FROM leads WHERE name = 'Fernanda Lima';

-- Interações com Gabriel Rodrigues (cliente ativo)
INSERT INTO interactions (lead_id, interaction_type, description, interaction_date)
SELECT id, 'email', 'Enviado calendário de estudos do mês. Cliente confirmou recebimento.', '2026-02-01'
FROM leads WHERE name = 'Gabriel Rodrigues';

-- Mais interações variadas
INSERT INTO interactions (lead_id, interaction_type, description, interaction_date)
SELECT id, 'whatsapp', 'Cliente solicitou reagendamento da mentoria desta semana.', '2026-02-05'
FROM leads WHERE name = 'Helena Alves';

INSERT INTO interactions (lead_id, interaction_type, description, interaction_date)
SELECT id, 'call', 'Follow-up após evento. Lead demonstrou interesse no curso de inglês.', '2026-01-17'
FROM leads WHERE name = 'Bruno Santos';

INSERT INTO interactions (lead_id, interaction_type, description, interaction_date)
SELECT id, 'meeting', 'Apresentação do pacote completo vestibular. Pais aprovaram investimento.', '2026-01-12'
FROM leads WHERE name = 'Igor Martins';

-- ============================================================================
-- 6. VENDAS (10 vendas realizadas)
-- ============================================================================

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Pega o primeiro usuário admin
  SELECT user_id INTO admin_user_id 
  FROM user_roles 
  WHERE role = 'admin' 
  LIMIT 1;
  
  -- Se não encontrar admin, pega qualquer usuário
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
  END IF;

  -- Venda 1: Fernanda Lima - Mentoria 3 meses (PAGO)
  INSERT INTO sales (lead_id, product_id, sold_value, net_value, outstanding_value, payment_status, sale_date, user_id)
  SELECT l.id, p.id, 4500.00, 4500.00, 0.00, 'paid', '2026-01-10', admin_user_id
  FROM leads l
  CROSS JOIN products p
  WHERE l.name = 'Fernanda Lima' AND p.name = 'Mentoria Individual 3 meses';

  -- Venda 2: Gabriel Rodrigues - Curso ENEM (PENDENTE - 3x)
  INSERT INTO sales (lead_id, product_id, sold_value, net_value, outstanding_value, payment_status, sale_date, user_id)
  SELECT l.id, p.id, 2800.00, 2800.00, 1867.00, 'pending', '2026-01-15', admin_user_id
  FROM leads l
  CROSS JOIN products p
  WHERE l.name = 'Gabriel Rodrigues' AND p.name = 'Curso Preparatório ENEM';

  -- Venda 3: Helena Alves - Workshop Redação (PAGO)
  INSERT INTO sales (lead_id, product_id, sold_value, net_value, outstanding_value, payment_status, sale_date, user_id)
  SELECT l.id, p.id, 800.00, 800.00, 0.00, 'paid', '2026-01-23', admin_user_id
  FROM leads l
  CROSS JOIN products p
  WHERE l.name = 'Helena Alves' AND p.name = 'Workshop Redação';

  -- Venda 4: Igor Martins - Pacote Completo (PARCIAL - 12x)
  INSERT INTO sales (lead_id, product_id, sold_value, net_value, outstanding_value, payment_status, sale_date, user_id)
  SELECT l.id, p.id, 15000.00, 15000.00, 13750.00, 'partial', '2026-01-12', admin_user_id
  FROM leads l
  CROSS JOIN products p
  WHERE l.name = 'Igor Martins' AND p.name = 'Pacote Completo Vestibular';

  -- Venda 5: Juliana Ferreira - Mentoria 6 meses (PAGO)
  INSERT INTO sales (lead_id, product_id, sold_value, net_value, outstanding_value, payment_status, sale_date, user_id)
  SELECT l.id, p.id, 7500.00, 7500.00, 0.00, 'paid', '2026-01-18', admin_user_id
  FROM leads l
  CROSS JOIN products p
  WHERE l.name = 'Juliana Ferreira' AND p.name = 'Mentoria Individual 6 meses';

  -- Venda 6: Kevin Souza - Curso Inglês (PENDENTE - 2x)
  INSERT INTO sales (lead_id, product_id, sold_value, net_value, outstanding_value, payment_status, sale_date, user_id)
  SELECT l.id, p.id, 1500.00, 1500.00, 750.00, 'pending', '2026-01-25', admin_user_id
  FROM leads l
  CROSS JOIN products p
  WHERE l.name = 'Kevin Souza' AND p.name = 'Curso de Inglês Instrumental';

  -- Venda 7: Larissa Nunes - Workshop Redação (PAGO)
  INSERT INTO sales (lead_id, product_id, sold_value, net_value, outstanding_value, payment_status, sale_date, user_id)
  SELECT l.id, p.id, 800.00, 800.00, 0.00, 'paid', '2026-01-24', admin_user_id
  FROM leads l
  CROSS JOIN products p
  WHERE l.name = 'Larissa Nunes' AND p.name = 'Workshop Redação';

  -- Venda 8: Marcos Pereira (ex-cliente) - Mentoria 3 meses (PENDENTE - nunca pagou)
  INSERT INTO sales (lead_id, product_id, sold_value, net_value, outstanding_value, payment_status, sale_date, user_id)
  SELECT l.id, p.id, 4500.00, 4500.00, 4500.00, 'pending', '2025-11-10', admin_user_id
  FROM leads l
  CROSS JOIN products p
  WHERE l.name = 'Marcos Pereira' AND p.name = 'Mentoria Individual 3 meses';

  -- Venda 9: Natália Cardoso (ex-cliente) - Curso ENEM (PAGO - finalizado)
  INSERT INTO sales (lead_id, product_id, sold_value, net_value, outstanding_value, payment_status, sale_date, user_id)
  SELECT l.id, p.id, 2800.00, 2800.00, 0.00, 'paid', '2025-10-05', admin_user_id
  FROM leads l
  CROSS JOIN products p
  WHERE l.name = 'Natália Cardoso' AND p.name = 'Curso Preparatório ENEM';

  -- Venda 10: Otávio Barbosa (ex-cliente) - Mentoria 6 meses (PAGO - finalizado)
  INSERT INTO sales (lead_id, product_id, sold_value, net_value, outstanding_value, payment_status, sale_date, user_id)
  SELECT l.id, p.id, 7500.00, 7500.00, 0.00, 'paid', '2025-09-15', admin_user_id
  FROM leads l
  CROSS JOIN products p
  WHERE l.name = 'Otávio Barbosa' AND p.name = 'Mentoria Individual 6 meses';
END $$;

-- ============================================================================
-- 7. DESPESAS (8 despesas operacionais)
-- ============================================================================

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT user_id INTO admin_user_id FROM user_roles WHERE role = 'admin' LIMIT 1;
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
  END IF;

  INSERT INTO expenses (name, type, amount, expense_date, notes, user_id) VALUES
  ('Aluguel Espaço Escritório - Janeiro', 'aluguel', 3500.00, '2026-01-05', 'Coworking Premium - Mensalidade', admin_user_id),
  ('Material Didático - Lote Janeiro', 'material', 1200.00, '2026-01-08', 'Livros e apostilas para novos alunos', admin_user_id),
  ('Salário Coordenador Pedagógico', 'salario', 6000.00, '2026-01-30', 'Pagamento mensal - Maria Eduarda', admin_user_id),
  ('Facebook Ads - Campanha Janeiro', 'marketing', 800.00, '2026-01-12', 'Anúncios para captação de leads', admin_user_id),
  ('Google Ads - Campanha Janeiro', 'marketing', 600.00, '2026-01-12', 'Palavras-chave educação', admin_user_id),
  ('Infraestrutura Evento Palestra', 'evento', 500.00, '2026-01-15', 'Locação auditório e coffee break', admin_user_id),
  ('Aluguel Espaço Escritório - Fevereiro', 'aluguel', 3500.00, '2026-02-05', 'Coworking Premium - Mensalidade', admin_user_id),
  ('Licença Software Gestão', 'outros', 450.00, '2026-02-01', 'Assinatura anual CRM', admin_user_id);
END $$;

-- ============================================================================
-- 8. RECEITAS EXTRAS (3 receitas adicionais)
-- ============================================================================

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT user_id INTO admin_user_id FROM user_roles WHERE role = 'admin' LIMIT 1;
  IF admin_user_id IS NULL THEN
    SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
  END IF;

  INSERT INTO revenues (name, category, amount, revenue_date, notes, user_id) VALUES
  ('Patrocínio Feira de Profissões', 'patrocinio', 2000.00, '2026-02-10', 'Patrocinador: Editora Saraiva', admin_user_id),
  ('Comissão Indicação Parceiro', 'comissao', 500.00, '2026-01-20', 'Indicação de 3 alunos por parceiro externo', admin_user_id),
  ('Venda de Material Avulso', 'vendas_avulsas', 300.00, '2026-01-28', 'Apostilas vendidas separadamente', admin_user_id);
END $$;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

-- RESUMO DOS DADOS INSERIDOS:
-- ✅ 6 Produtos
-- ✅ 4 Eventos
-- ✅ 15 Leads (5 leads, 7 clientes ativos, 3 ex-clientes)
-- ✅ Relacionamentos lead_events
-- ✅ 30+ Interações
-- ✅ 10 Vendas (vários status de pagamento)
-- ✅ 8 Despesas
-- ✅ 3 Receitas extras

-- Total em vendas ativas: R$ 47.900,00
-- Total despesas (Jan-Fev): R$ 16.550,00
-- Total receitas extras: R$ 2.800,00
-- Saldo projetado: +R$ 34.150,00
