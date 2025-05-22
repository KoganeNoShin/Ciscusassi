//importo il db
import db from '../../db';

const nomeTabella = 'clienti';


export function createIfDoesntExists(): Promise<string> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {

            db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                numero_carta INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                cognome TEXT NOT NULL,
                email TEXT NOT NULL,
                data_nascita TEXT,
                password TEXT NOT NULL,
                punti INTEGER NOT NULL DEFAULT 0,
                image BLOB NOT NULL
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

export function dropTable(): Promise<string> {
    return new Promise((resolve, reject) => {
        db.run(`DROP TABLE IF EXISTS ${nomeTabella}`, (err: Error | null) => {
            if (err) {
                reject(`❌ Errore durante il drop della tabella: ${nomeTabella}:${err.message}`);
            } else {
                resolve(`🗑️  Tabella ${nomeTabella} droppata.`);
            }
        });
    });
}

export default { createIfDoesntExists, dropTable };