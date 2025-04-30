//importo il db
const db = require('../db');

const nomeTabella = 'torrette';

function createIfDoesntExists() 
{

    db.serialize(() => {

        db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
            id_torretta INTEGER PRIMARY KEY AUTOINCREMENT,
            ref_filiale INTEGER NOT NULL,
            FOREIGN KEY (ref_filiale) REFERENCES filiali (id_filiale)
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
