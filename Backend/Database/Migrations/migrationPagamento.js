//importo il db
const db = require('../../db');

const nomeTabella = 'pagamenti';

function createIfDoesntExists() 
{

    return new Promise((resolve, reject) => {
        db.serialize(() => {

            db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                id_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
                importo DOUBLE NOT NULL,
                data_ora_pagamento TEXT NOT NULL          
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
