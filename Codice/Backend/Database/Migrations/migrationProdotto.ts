//importo il db
import db from '../../db';

const nomeTabella = 'prodotti';

export function createIfDoesntExists(): Promise<string> {
	return new Promise((resolve, reject) => {
		db.serialize(() => {
			db.run(
				`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                id_prodotto INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                descrizione TEXT NOT NULL,
                costo DOUBLE NOT NULL,
                immagine BLOB NOT NULL,
                categoria TEXT NOT NULL,
                is_piatto_giorno BOOLEAN DEFAULT 0
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
