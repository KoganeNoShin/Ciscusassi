//importo il db
const db = require('../../db');

const nomeTabella = 'clienti';


function createIfDoesntExists() {

    db.serialize(() => {

        db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
            numero_carta INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT UNIQUE NOT NULL,
            cognome TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            data_nascita TEXT,
            password TEXT NOT NULL,
            punti INTEGER NOT NULL
        )`, (err) => 
        {
            if (err) console.error(`❌ Errore durante la creazione della tabella ${nomeTabella}:`, err.message);
            else console.log(`✅ Tabella ${nomeTabella} creata con successo o già esistente.`);
        });  
    
    });
}

function dropTable()
{
    db.run(`DROP TABLE IF EXISTS ${nomeTabella}`, (err) => {
        if (err) console.error(`❌ Errore durante il drop della tabella: ${nomeTabella}`, err.message);
        else console.log(`🗑️  Tabella ${nomeTabella} droppata.`);
    });
}

module.exports = { createIfDoesntExists, dropTable };