//importo il db
import db from '../../db';

const nomeTabella = 'torrette';

function createIfDoesntExists() : Promise<string> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {

            db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                id_torretta INTEGER PRIMARY KEY AUTOINCREMENT,
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