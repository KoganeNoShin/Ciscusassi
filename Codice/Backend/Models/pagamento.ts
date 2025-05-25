// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello di un Pagamento
export interface PagamentoInput {
	importo: number;
	data_ora_pagamento: string;
}

export interface PagamentoRecord extends PagamentoInput {
	id_pagamento: number;
}

export class Pagamento {
	// Creazione di un nuovo pagamento
	static async create(data: PagamentoInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO pagamenti (importo, data_ora_pagamento) VALUES (?, ?)',
				[data.importo, data.data_ora_pagamento],
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

	// Selezione per ID
	static async getByID(id: number): Promise<PagamentoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM pagamenti WHERE id_pagamento = ?',
				[id],
				(err: Error | null, row: PagamentoRecord | null) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.log('⚠️ [DB WARNING] Nessun Pagamento trovato');
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}
}

export default Pagamento;