//importo il db
const db = require('../../db');

const nomeTabella = 'filiali';

function createIfDoesntExists() {

    return new Promise((resolve, reject) => {
        db.serialize(() => {

            db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                id_filiale INTEGER PRIMARY KEY AUTOINCREMENT,
                comune TEXT NOT NULL,
                num_tavoli INTEGER NOT NULL,
                indirizzo TEXT UNIQUE NOT NULL,
                longitudine REAL NOT NULL,
                latitudine REAL NOT NULL,
                immagine BLOB            
            )`, (err) => {
                if (err) {
                    console.error(`❌ Errore durante la creazione della tabella ${nomeTabella}:`, err.message);
                    reject(err);
                } else {
                    console.log(`✅ Tabella ${nomeTabella} creata con successo o già esistente.`);
                    resolve();
                }
            });  
    
        });
    });

    

}

function dropTable()
{
    return new Promise((resolve, reject) => {
        db.run(`DROP TABLE IF EXISTS ${nomeTabella}`, (err) => {
            if (err)
            {
                console.error(`❌ Errore durante il drop della tabella: ${nomeTabella}`, err.message);
                reject(err);
            } 
            else
            {
                console.log(`🗑️  Tabella ${nomeTabella} droppata.`);
                resolve();
            } 
        });
    });
}

module.exports = { createIfDoesntExists, dropTable };
