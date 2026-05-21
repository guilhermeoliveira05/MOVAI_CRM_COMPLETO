/**
 * Script de seed - Dados de exemplo para testes
 * Executa: npm run seed
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { initializeDatabase } = require('./init');
const { getDatabase, closeDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');

function seed() {
  // Inicializar tabelas
  initializeDatabase();
  const db = getDatabase();

  console.log('\n🌱 Inserindo dados de exemplo...\n');

  // Limpar dados existentes
  db.exec('DELETE FROM interactions');
  db.exec('DELETE FROM chat_conversations');
  db.exec('DELETE FROM appointments');
  db.exec('DELETE FROM leads');
  db.exec('DELETE FROM properties');
  db.exec('DELETE FROM users');

  // Reiniciar contadores AUTOINCREMENT para manter IDs previsíveis no seed
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('interactions', 'chat_conversations', 'appointments', 'leads', 'properties', 'users')");

  // ==================== USUÁRIOS ====================
  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)'
  );
  const passwordHash = bcrypt.hashSync('123456', 10);

  insertUser.run('Admin MOVAI', 'admin@movai.com.br', passwordHash, 'admin', '(11) 99999-0001');
  insertUser.run('Carlos Silva', 'carlos@movai.com.br', passwordHash, 'agent', '(11) 99999-0002');
  insertUser.run('Ana Oliveira', 'ana@movai.com.br', passwordHash, 'agent', '(11) 99999-0003');
  insertUser.run('Maria Viewer', 'maria@movai.com.br', passwordHash, 'viewer', '(11) 99999-0004');
  console.log('✅ 4 usuários criados (senha: 123456)');

  // ==================== IMÓVEIS ====================
  const insertProperty = db.prepare(
    `INSERT INTO properties (title, description, type, transaction_type, price, location, address, city, state, bedrooms, bathrooms, parking_spots, area, status, images, featured, agent_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  insertProperty.run(
    'Apartamento Luxo Jardins', 'Apartamento de alto padrão com vista panorâmica, acabamento premium e lazer completo. Próximo ao metrô e com fácil acesso às principais vias. Condomínio com academia, piscina e salão de festas.',
    'apartamento', 'venda', 1250000, 'Jardins, São Paulo', 'Rua Oscar Freire, 1500', 'São Paulo', 'SP',
    3, 2, 2, 120, 'disponivel', JSON.stringify(['/uploads/properties/apt_luxo_jardins_1.jpg', '/uploads/properties/apt_luxo_jardins_2.jpg', '/uploads/properties/apt_luxo_jardins_3.jpg', '/uploads/properties/interior_moderno_1.jpg']), 1, 2
  );
  insertProperty.run(
    'Casa com Piscina Alphaville', 'Casa espaçosa em condomínio fechado, com piscina, churrasqueira e área gourmet. Segurança 24h. Amplo jardim com paisagismo profissional e garagem coberta para 3 veículos.',
    'casa', 'venda', 2800000, 'Alphaville, Barueri', 'Alameda dos Ipês, 300', 'Barueri', 'SP',
    4, 3, 3, 350, 'disponivel', JSON.stringify(['/uploads/properties/casa_piscina_alpha_1.jpg', '/uploads/properties/casa_piscina_alpha_2.jpg', '/uploads/properties/casa_piscina_alpha_3.jpg', '/uploads/properties/area_lazer_1.jpg']), 1, 2
  );
  insertProperty.run(
    'Studio Moderno Vila Madalena', 'Studio compacto e funcional, ideal para jovens profissionais. Próximo a bares, restaurantes e transporte público. Mobiliado com design contemporâneo.',
    'studio', 'aluguel', 3200, 'Vila Madalena, São Paulo', 'Rua Wisard, 200', 'São Paulo', 'SP',
    1, 1, 0, 35, 'disponivel', JSON.stringify(['/uploads/properties/studio_vila_mad_1.jpg', '/uploads/properties/studio_vila_mad_2.jpg', '/uploads/properties/studio_vila_mad_3.jpg']), 0, 3
  );
  insertProperty.run(
    'Cobertura Duplex Moema', 'Cobertura duplex com terraço, jacuzzi e vista deslumbrante da cidade. Acabamento de primeira linha. Lareira, closet e varanda gourmet com churrasqueira.',
    'cobertura', 'venda', 3500000, 'Moema, São Paulo', 'Av. Jurema, 450', 'São Paulo', 'SP',
    4, 4, 3, 280, 'reservado', JSON.stringify(['/uploads/properties/cobertura_moema_1.jpg', '/uploads/properties/cobertura_moema_2.jpg', '/uploads/properties/cobertura_moema_3.jpg', '/uploads/properties/suite_master_1.jpg', '/uploads/properties/varanda_gourmet_1.jpg']), 1, 2
  );
  insertProperty.run(
    'Sala Comercial Faria Lima', 'Sala comercial em edifício corporativo Triple A, com infraestrutura completa e localização privilegiada. Piso elevado, ar condicionado central e 2 vagas.',
    'comercial', 'aluguel', 8500, 'Faria Lima, São Paulo', 'Av. Faria Lima, 3000', 'São Paulo', 'SP',
    0, 2, 2, 80, 'disponivel', JSON.stringify(['/uploads/properties/sala_faria_lima_1.jpg', '/uploads/properties/sala_faria_lima_2.jpg', '/uploads/properties/sala_faria_lima_3.jpg']), 0, 3
  );
  insertProperty.run(
    'Terreno Granja Viana', 'Terreno plano em condomínio de alto padrão com infraestrutura completa, pronto para construção. Topografia ideal, rua asfaltada e vizinhança consolidada.',
    'terreno', 'venda', 950000, 'Granja Viana, Cotia', 'Rua das Palmeiras, 100', 'Cotia', 'SP',
    0, 0, 0, 500, 'disponivel', JSON.stringify(['/uploads/properties/terreno_granja_1.jpg', '/uploads/properties/terreno_granja_2.jpg']), 0, 2
  );
  insertProperty.run(
    'Apartamento Vendido Pinheiros', 'Apartamento de 2 quartos já vendido, excelente referência de preço na região. Reformado com cozinha americana e varanda.',
    'apartamento', 'venda', 780000, 'Pinheiros, São Paulo', 'Rua dos Pinheiros, 800', 'São Paulo', 'SP',
    2, 1, 1, 70, 'vendido', JSON.stringify(['/uploads/properties/apt_pinheiros_1.jpg', '/uploads/properties/apt_pinheiros_2.jpg', '/uploads/properties/cozinha_planejada_1.jpg']), 0, 3
  );
  console.log('✅ 7 imóveis criados');

  // ==================== LEADS ====================
  const insertLead = db.prepare(
    `INSERT INTO leads (name, email, phone, message, property_id, status, source, assigned_to, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  insertLead.run('João Pereira', 'joao.pereira@email.com', '(11) 98765-0001', 'Tenho interesse no apartamento dos Jardins', 1, 'qualificado', 'site', 2, '2026-03-15 10:30:00');
  insertLead.run('Fernanda Costa', 'fernanda.costa@email.com', '(11) 98765-0002', 'Gostaria de agendar visita na casa de Alphaville', 2, 'contatado', 'site', 2, '2026-03-20 14:00:00');
  insertLead.run('Ricardo Santos', 'ricardo.santos@email.com', '(11) 98765-0003', 'Busco imóvel para investimento', null, 'novo', 'chatbot', 3, '2026-04-01 09:15:00');
  insertLead.run('Camila Almeida', 'camila.almeida@email.com', '(11) 98765-0004', 'Procuro apartamento para alugar na Vila Madalena', 3, 'negociando', 'redes_sociais', 3, '2026-04-03 11:00:00');
  insertLead.run('Pedro Mendes', 'pedro.mendes@email.com', '(11) 98765-0005', 'Interesse na cobertura de Moema', 4, 'convertido', 'indicacao', 2, '2026-02-10 16:30:00');
  insertLead.run('Juliana Lima', 'juliana.lima@email.com', '(11) 98765-0006', 'Quero saber mais sobre a sala comercial', 5, 'novo', 'site', null, '2026-04-10 08:45:00');
  insertLead.run('Marcos Ribeiro', 'marcos.ribeiro@email.com', '(11) 98765-0007', 'Procuro terreno para construir', 6, 'contatado', 'telefone', 2, '2026-04-05 13:00:00');
  insertLead.run('Lucia Ferreira', 'lucia.ferreira@email.com', '(11) 98765-0008', 'Preciso de ajuda para encontrar imóvel', null, 'novo', 'chatbot', null, '2026-04-11 17:20:00');
  insertLead.run('Bruno Martins', 'bruno.martins@email.com', '(11) 98765-0009', 'Interesse em imóveis de alto padrão', 1, 'qualificado', 'site', 3, '2026-03-28 10:00:00');
  insertLead.run('Patricia Sousa', 'patricia.sousa@email.com', '(11) 98765-0010', 'Vendendo meu imóvel e procurando outro', null, 'perdido', 'outro', 2, '2026-01-15 14:30:00');
  console.log('✅ 10 leads criados');

  // ==================== AGENDAMENTOS ====================
  const insertAppointment = db.prepare(
    `INSERT INTO appointments (lead_id, property_id, agent_id, date, time, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  insertAppointment.run(1, 1, 2, '2026-04-15', '10:00', 'confirmado', 'Cliente VIP, preparar documentação');
  insertAppointment.run(2, 2, 2, '2026-04-16', '14:30', 'pendente', 'Primeira visita ao imóvel');
  insertAppointment.run(4, 3, 3, '2026-04-14', '11:00', 'confirmado', 'Levar contrato de aluguel');
  insertAppointment.run(7, 6, 2, '2026-04-17', '09:00', 'pendente', 'Visita ao terreno');
  insertAppointment.run(9, 1, 3, '2026-04-18', '16:00', 'pendente', 'Segunda visita');
  insertAppointment.run(5, 4, 2, '2026-03-15', '10:00', 'realizado', 'Fechamento de contrato');
  console.log('✅ 6 agendamentos criados');

  // ==================== CONVERSAS DO CHATBOT ====================
  const insertChat = db.prepare(
    `INSERT INTO chat_conversations (lead_id, visitor_name, visitor_email, messages, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  insertChat.run(3, 'Ricardo Santos', 'ricardo.santos@email.com', JSON.stringify([
    { role: 'bot', content: 'Olá! Sou o assistente virtual da MOVAI. Como posso ajudar?', timestamp: '2026-04-01T09:15:00Z' },
    { role: 'user', content: 'Busco imóvel para investimento em São Paulo', timestamp: '2026-04-01T09:15:30Z' },
    { role: 'bot', content: 'Temos ótimas opções! Qual seu orçamento e preferência de região?', timestamp: '2026-04-01T09:15:35Z' },
    { role: 'user', content: 'Até R$ 1.5 milhão, de preferência zona oeste', timestamp: '2026-04-01T09:16:00Z' },
    { role: 'bot', content: 'Encontrei 3 opções excelentes para você! Posso agendar uma visita?', timestamp: '2026-04-01T09:16:05Z' },
  ]), 'encerrada', '2026-04-01 09:15:00');

  insertChat.run(8, 'Lucia Ferreira', 'lucia.ferreira@email.com', JSON.stringify([
    { role: 'bot', content: 'Olá! Bem-vinda à MOVAI. Em que posso ajudar?', timestamp: '2026-04-11T17:20:00Z' },
    { role: 'user', content: 'Olá, preciso de ajuda para encontrar um apartamento', timestamp: '2026-04-11T17:20:15Z' },
    { role: 'bot', content: 'Claro! Vou te ajudar. Você está procurando para compra ou aluguel?', timestamp: '2026-04-11T17:20:20Z' },
    { role: 'user', content: 'Aluguel, até R$ 4.000 por mês', timestamp: '2026-04-11T17:20:45Z' },
  ]), 'ativa', '2026-04-11 17:20:00');

  insertChat.run(null, 'Visitante Anônimo', null, JSON.stringify([
    { role: 'bot', content: 'Olá! Como posso ajudar?', timestamp: '2026-04-12T08:00:00Z' },
    { role: 'user', content: 'Quais regiões vocês atendem?', timestamp: '2026-04-12T08:00:10Z' },
    { role: 'bot', content: 'Atendemos toda a Grande São Paulo! Posso te ajudar a encontrar o imóvel ideal.', timestamp: '2026-04-12T08:00:15Z' },
  ]), 'encerrada', '2026-04-12 08:00:00');
  console.log('✅ 3 conversas do chatbot criadas');

  // ==================== INTERAÇÕES ====================
  const insertInteraction = db.prepare(
    'INSERT INTO interactions (lead_id, user_id, type, description, created_at) VALUES (?, ?, ?, ?, ?)'
  );

  insertInteraction.run(1, 2, 'nota', 'Lead criado via site', '2026-03-15 10:30:00');
  insertInteraction.run(1, 2, 'ligacao', 'Ligou para confirmar interesse. Cliente quer visitar o imóvel.', '2026-03-16 11:00:00');
  insertInteraction.run(1, 2, 'visita', 'Realizou visita ao apartamento. Gostou muito.', '2026-03-20 14:00:00');
  insertInteraction.run(2, 2, 'nota', 'Lead criado via site', '2026-03-20 14:00:00');
  insertInteraction.run(2, 2, 'email', 'Enviado email com fotos adicionais da casa', '2026-03-21 09:00:00');
  insertInteraction.run(4, 3, 'mensagem', 'Contato via WhatsApp para discutir valores de aluguel', '2026-04-04 10:00:00');
  insertInteraction.run(5, 2, 'proposta', 'Proposta aceita! Contrato em preparação.', '2026-03-10 15:00:00');
  insertInteraction.run(5, 2, 'nota', 'Status alterado de "negociando" para "convertido"', '2026-03-12 10:00:00');
  insertInteraction.run(7, 2, 'ligacao', 'Primeiro contato realizado. Interessado no terreno.', '2026-04-06 10:00:00');
  insertInteraction.run(9, 3, 'nota', 'Lead qualificado - alto poder aquisitivo', '2026-03-29 11:00:00');
  console.log('✅ 10 interações criadas');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n🔑 Credenciais de acesso:');
  console.log('   Admin: admin@movai.com.br / 123456');
  console.log('   Agent: carlos@movai.com.br / 123456');
  console.log('   Agent: ana@movai.com.br / 123456');
  console.log('   Viewer: maria@movai.com.br / 123456\n');
}

if (require.main === module) {
  try {
    seed();
    closeDatabase();
  } catch (err) {
    console.error('❌ Erro no seed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

module.exports = { seed };
