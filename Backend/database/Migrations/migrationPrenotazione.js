//importo il db
const db = require('../../db');

const nomeTabella = 'prenotazioni';

function createIfDoesntExists() 
{

    return new Promise((resolve, reject) => {
        db.serialize(() => {

            db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                id_prenotazione INTEGER PRIMARY KEY AUTOINCREMENT,
                numero_persone INTEGER NOT NULL DEFAULT 1,   
                data_ora_prenotazione TEXT NOT NULL,
                otp TEXT NOT NULL,
                ref_cliente INTEGER NULLABLE,
                ref_torretta INTEGER NOT NULL,                            
                FOREIGN KEY (ref_cliente) REFERENCES clienti (numero_carta),
                FOREIGN KEY (ref_torretta) REFERENCES torrette (id_torretta)
            )`, (err) => {
                if (err) {
                    console.error(`❌ Errore durante la creazione della tabella ${nomeTabella}:`, err.message);
                    reject();
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
