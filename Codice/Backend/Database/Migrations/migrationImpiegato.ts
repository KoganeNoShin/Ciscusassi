//importo il db
import db from '../../db';

const nomeTabella = 'impiegati';

function createIfDoesntExists() : Promise<string> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {

            db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                matricola INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                cognome TEXT NOT NULL,
                ruolo TEXT NOT NULL,
                foto BLOB NOT NULL,
                password TEXT NOT NULL,
                email TEXT NOT NULL,
                data_nascita TEXT NOT NULL,
                ref_filiale INTEGER NOT NULL,
                FOREIGN KEY (ref_filiale) REFERENCES filiali (id_filiale) 
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
