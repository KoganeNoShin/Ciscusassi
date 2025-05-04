//importo il db
const db = require('../../db');

const nomeTabella = 'ordini';

function createIfDoesntExists() 
{

    return new Promise((resolve, reject) => {
        db.serialize(() => {

            db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                id_ordine INTEGER PRIMARY KEY AUTOINCREMENT,            
                data_ora_ordinazione TEXT NOT NULL,
                username_ordinante TEXT NOT NULL,
                ref_pagamento INTEGER NULLABLE,
                ref_cliente INTEGER NULLABLE,
                ref_prenotazione INTEGER NOT NULL,
                FOREIGN KEY (ref_pagamento) REFERENCES pagamenti (id_pagamento),
                FOREIGN KEY (ref_cliente) REFERENCES clienti (numero_carta),
                FOREIGN KEY (ref_prenotazione) REFERENCES prenotazioni (id_prenotazione)
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
