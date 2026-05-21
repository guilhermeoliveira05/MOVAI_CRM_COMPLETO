/**
 * Configuração do banco de dados SQLite
 * Utiliza better-sqlite3 para operações síncronas e performáticas
 */
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DB_PATH = process.env.DB_PATH || './database/movai.db';
const dbPath = path.resolve(__dirname, '..', DB_PATH);

let db;

/**
 * Retorna a instância singleton do banco de dados
 */
function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    // Habilitar WAL mode para melhor performance
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

/**
 * Fecha a conexão com o banco
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDatabase, closeDatabase };
