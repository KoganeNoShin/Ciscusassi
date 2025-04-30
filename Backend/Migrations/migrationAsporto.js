//importo il db
const db = require('../db');

const nomeTabella = 'asporti';

function createIfDoesntExists() 
{

    db.serialize(() => {

        db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
            id_asporto INTEGER PRIMARY KEY AUTOINCREMENT,
            indirizzo TEXT NOT NULL,
            data_ora_consegna TEXT NOT NULL,
            ref_cliente INTEGER NOT NULL,
            FOREIGN KEY (ref_cliente) REFERENCES cliente (numero_carta)
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
