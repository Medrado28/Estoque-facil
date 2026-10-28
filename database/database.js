const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "estoque.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT '',
    quantidade INTEGER NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
    minimo INTEGER NOT NULL DEFAULT 0 CHECK (minimo >= 0),
    criado_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS movimentacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    observacao TEXT NOT NULL DEFAULT '',
    criada_em TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
  );
`);

module.exports = db;
