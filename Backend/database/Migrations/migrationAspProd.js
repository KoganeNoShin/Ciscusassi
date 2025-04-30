//importo il db
const db = require('../../db');

const nomeTabella = 'asp_prod';

function createIfDoesntExists() 
{

    db.serialize(() => {

        db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
            id_asp_prod INTEGER PRIMARY KEY AUTOINCREMENT,            
            ref_asporto INTEGER NOT NULL,
            ref_prodotto INTEGER NOT NULL,
            FOREIGN KEY (ref_asporto) REFERENCES asporto (id_asporto),
            FOREIGN KEY (ref_prodotto) REFERENCES prodotto (id_prodotto)
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
