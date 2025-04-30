//importo il db
const db = require('../db/database');

function createIfNotExists()
{
    db.run(`CREATE TABLE IF NOT EXISTS clienti (
        numero_carta INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL,
        cognome TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        data_nascita TEXT,
        password TEXT NOT NULL,
        punti INTEGER NOT NULL DEFAULT 0
    )`);   
}

module.exports = {createIfNotExists};
