/**
 * Script de inicialização do banco de dados
 * Cria todas as tabelas necessárias para o CRM MOVAI
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { getDatabase, closeDatabase } = require('../config/database');

function initializeDatabase() {
  const db = getDatabase();

  console.log('🔧 Inicializando banco de dados MOVAI...\n');

  // ==================== USERS ====================
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'agent' CHECK(role IN ('admin', 'agent', 'viewer')),
      phone TEXT,
      avatar TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabela users criada');

  // ==================== PROPERTIES ====================
  db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL CHECK(type IN ('casa', 'apartamento', 'terreno', 'comercial', 'cobertura', 'studio')),
      transaction_type TEXT NOT NULL DEFAULT 'venda' CHECK(transaction_type IN ('venda', 'aluguel', 'venda_aluguel')),
      price REAL NOT NULL,
      location TEXT NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT DEFAULT 'SP',
      zip_code TEXT,
      bedrooms INTEGER DEFAULT 0,
      bathrooms INTEGER DEFAULT 0,
      parking_spots INTEGER DEFAULT 0,
      area REAL,
      status TEXT NOT NULL DEFAULT 'disponivel' CHECK(status IN ('disponivel', 'vendido', 'alugado', 'reservado', 'inativo')),
      images TEXT DEFAULT '[]',
      featured INTEGER DEFAULT 0,
      agent_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);
  console.log('✅ Tabela properties criada');

  // ==================== LEADS ====================
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      message TEXT,
      property_id INTEGER,
      status TEXT NOT NULL DEFAULT 'novo' CHECK(status IN ('novo', 'contatado', 'qualificado', 'negociando', 'convertido', 'perdido')),
      source TEXT DEFAULT 'site' CHECK(source IN ('site', 'chatbot', 'telefone', 'indicacao', 'redes_sociais', 'outro')),
      assigned_to INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );
  `);
  console.log('✅ Tabela leads criada');

  // ==================== APPOINTMENTS ====================
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      property_id INTEGER,
      agent_id INTEGER,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente', 'confirmado', 'cancelado', 'realizado')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
      FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);
  console.log('✅ Tabela appointments criada');

  // ==================== CHAT CONVERSATIONS ====================
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      visitor_name TEXT,
      visitor_email TEXT,
      messages TEXT DEFAULT '[]',
      status TEXT DEFAULT 'ativa' CHECK(status IN ('ativa', 'encerrada', 'arquivada')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
    );
  `);
  console.log('✅ Tabela chat_conversations criada');

  // ==================== INTERACTIONS ====================
  db.exec(`
    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      user_id INTEGER,
      type TEXT NOT NULL CHECK(type IN ('ligacao', 'email', 'visita', 'mensagem', 'proposta', 'nota', 'chatbot')),
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);
  console.log('✅ Tabela interactions criada');

  // ==================== INDEXES ====================
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
    CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
    CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_property ON leads(property_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
    CREATE INDEX IF NOT EXISTS idx_appointments_lead ON appointments(lead_id);
    CREATE INDEX IF NOT EXISTS idx_interactions_lead ON interactions(lead_id);
    CREATE INDEX IF NOT EXISTS idx_chat_conversations_lead ON chat_conversations(lead_id);
  `);
  console.log('✅ Índices criados');

  console.log('\n🎉 Banco de dados inicializado com sucesso!');
}

// Executar se chamado diretamente
if (require.main === module) {
  try {
    initializeDatabase();
    closeDatabase();
  } catch (err) {
    console.error('❌ Erro ao inicializar banco:', err.message);
    process.exit(1);
  }
}

module.exports = { initializeDatabase };
