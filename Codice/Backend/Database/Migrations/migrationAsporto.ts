//importo il db
import db from '../../db';

const nomeTabella = 'asporti';

export function createIfDoesntExists(): Promise<string> {
	return new Promise((resolve, reject) => {
		db.serialize(() => {
			db.run(
				`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                id_asporto INTEGER PRIMARY KEY AUTOINCREMENT,
                indirizzo TEXT NOT NULL,
                data_ora_consegna TEXT NOT NULL,
                ref_cliente INTEGER NOT NULL,
				ref_pagamento INTEGER NOT NULL,
				ref_filiale INTEGER NOT NULL,
                FOREIGN KEY (ref_cliente) REFERENCES cliente (numero_carta)
				FOREIGN KEY (ref_pagamento) REFERENCES pagamento (id_pagamento)
				FOREIGN KEY (ref_filiale) REFERENCES filiale (id_filiale)
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
