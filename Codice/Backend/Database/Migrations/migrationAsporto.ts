//importo il db
import db from '../../db';

const nomeTabella = 'asporti';

export function createIfDoesntExists() : Promise<string>
{
    return new Promise((resolve, reject) => {
        db.serialize(() => {

            db.run(`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                id_asporto INTEGER PRIMARY KEY AUTOINCREMENT,
                indirizzo TEXT NOT NULL,
                data_ora_consegna TEXT NOT NULL,
                ref_cliente INTEGER NOT NULL,
                FOREIGN KEY (ref_cliente) REFERENCES cliente (numero_carta)
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
