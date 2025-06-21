//importo il db
import db from '../../db';

const nomeTabella = 'prenotazioni';

export function createIfDoesntExists(): Promise<string> {
	return new Promise((resolve, reject) => {
		db.serialize(() => {
			db.run(
				`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                id_prenotazione INTEGER PRIMARY KEY AUTOINCREMENT,
                numero_persone INTEGER NOT NULL DEFAULT 1,   
                data_ora_prenotazione TEXT NOT NULL,
                otp TEXT NULLABLE,
                ref_cliente INTEGER NULLABLE,
                ref_torretta INTEGER NULLABLE,                            
                FOREIGN KEY (ref_cliente) REFERENCES clienti (numero_carta),
                FOREIGN KEY (ref_torretta) REFERENCES torrette (id_torretta)
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
