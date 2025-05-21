//importo il db
import db from '../../db';

const nomeTabella = 'ord_prod';

function createIfDoesntExists() : Promise<string> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {

            db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                id_ord_prod INTEGER PRIMARY KEY AUTOINCREMENT,            
                ref_ordine INTEGER NOT NULL,
                ref_prodotto INTEGER NOT NULL,
                stato TEXT NOT NULL DEFAULT "NON IN LAVORAZIONE",
                is_romana BOOLEAN DEFAULT 0,
                FOREIGN KEY (ref_ordine) REFERENCES ordine (id_ordine),
                FOREIGN KEY (ref_prodotto) REFERENCES prodotto (id_prodotto)
            )`, 
            (err: Error | null) => {
                if (err) {
                    reject(`❌ Errore durante la creazione della tabella ${nomeTabella}:${err.message}`);
                } else {
                    resolve(`✅ Tabella ${nomeTabella} creata con successo o già esistente!`);
                }
            });
        });
    });

}

export function dropTable() : Promise<string>
{
    return new Promise((resolve, reject) => {
        db.run(`DROP TABLE IF EXISTS ${nomeTabella}`, (err: Error |  null) => {
            if (err) {
                reject(`❌ Errore durante il drop della tabella: ${nomeTabella}:${err.message}`);
            } else {
                resolve(`🗑️  Tabella ${nomeTabella} droppata.`);
            }            
        });
    });
}