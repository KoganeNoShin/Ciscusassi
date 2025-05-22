//importo il db
import db from '../../db';

const nomeTabella = 'filiali';

export function createIfDoesntExists(): Promise<string> {
	return new Promise((resolve, reject) => {
		db.serialize(() => {
			db.run(
				`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                id_filiale INTEGER PRIMARY KEY AUTOINCREMENT,
                comune TEXT NOT NULL,
                num_tavoli INTEGER NOT NULL,
                indirizzo TEXT UNIQUE NOT NULL,
                longitudine REAL NOT NULL,
                latitudine REAL NOT NULL,
                immagine BLOB            
            )`,
				(err: Error | null) => {
					if (err) {
						reject(
							`❌ Errore durante la creazione della tabella ${nomeTabella}:${err.message}`
						);
					} else {
						resolve(
							`✅ Tabella ${nomeTabella} creata con successo o già esistente!`
						);
					}
				}
			);
		});
	});
}

export function dropTable(): Promise<string> {
	return new Promise((resolve, reject) => {
		db.run(`DROP TABLE IF EXISTS ${nomeTabella}`, (err: Error | null) => {
			if (err) {
				reject(
					`❌ Errore durante il drop della tabella: ${nomeTabella}:${err.message}`
				);
			} else {
				resolve(`🗑️  Tabella ${nomeTabella} droppata.`);
			}
		});
	});
}

export default { createIfDoesntExists, dropTable };
