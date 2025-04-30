//importo il db
const db = require('../db');

const nomeTabella = 'ord_prod';

function createIfDoesntExists() 
{

    db.serialize(() => {

        db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
            id_ord_prod INTEGER PRIMARY KEY AUTOINCREMENT,            
            ref_ordine INTEGER NOT NULL,
            ref_prodotto INTEGER NOT NULL,
            stato TEXT NOT NULL DEFAULT "NON IN LAVORAZIONE",
            is_romana BOOLEAN DEFAULT 0,
            FOREIGN KEY (ref_ordine) REFERENCES ordine (id_ordine),
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
