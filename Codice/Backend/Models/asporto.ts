// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello di un asporto
export interface AsportoInput {
	indirizzo: string;
	data_ora_consegna: string;
	ref_cliente: number;
	ref_pagamento: number;
}

export interface AsportoRecord extends AsportoInput {
	id_asporto: number;
}

export class Asporto {
	// Creazione di un nuovo asporto
	static async create(data: AsportoInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO asporti (indirizzo, data_ora_consegna, ref_cliente, ref_pagamento) VALUES (?, ?, ?, ?)',
				[data.indirizzo, data.data_ora_consegna, data.ref_cliente, data.ref_pagamento],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante INSERT:', err.message);
						reject(err);
					}
					else resolve(this.lastID);
				}
			);
		});
	}
}

export default Asporto;