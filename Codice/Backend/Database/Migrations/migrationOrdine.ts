//importo il db
import db from '../../db';

const nomeTabella = 'ordini';

export function createIfDoesntExists(): Promise<string> {
	return new Promise((resolve, reject) => {
		db.serialize(() => {
			db.run(
				`CREATE TABLE IF NOT EXISTS ${nomeTabella} (
                id_ordine INTEGER PRIMARY KEY AUTOINCREMENT,
                username_ordinante TEXT NOT NULL,
                ref_pagamento INTEGER NULLABLE,
                ref_cliente INTEGER NOT NULL,
                ref_prenotazione INTEGER NOT NULL,
                FOREIGN KEY (ref_pagamento) REFERENCES pagamenti (id_pagamento),
                FOREIGN KEY (ref_cliente) REFERENCES clienti (numero_carta),
                FOREIGN KEY (ref_prenotazione) REFERENCES prenotazioni (id_prenotazione)
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
