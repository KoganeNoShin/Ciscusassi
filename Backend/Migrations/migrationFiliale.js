//importo il db
const db = require('../db');

const nomeTabella = 'filiali';

function createIfDoesntExists() {


    db.serialize(() => {

        db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
            id_filiale INTEGER PRIMARY KEY AUTOINCREMENT,
            comune TEXT UNIQUE NOT NULL,
            indirizzo TEXT UNIQUE NOT NULL,
            num_tavoli INTEGER UNIQUE NOT NULL,
            immagine BLOB            
        )`, (err) => {
            if (err) {
                console.error(`❌ Errore durante la creazione della tabella ${nomeTabella}:`, err.message);
            } else {
                console.log(`✅ Tabella ${nomeTabella} creata con successo o già esistente.`);
            }
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
