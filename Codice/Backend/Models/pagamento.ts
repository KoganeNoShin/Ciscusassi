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

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
export class Pagamento {
	// definisco il metodo per creare un nuovo utente
	static async create(data: PagamentoInput): Promise<number> {
		const { importo, data_ora_pagamento } = data;

		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO pagamenti (importo, data_ora_pagamento) VALUES (?, ?)',
				[importo, data_ora_pagamento],
				function (this: RunResult, err: Error | null) {
					if (err) reject(err);
					else resolve(this.lastID);
				}
			);
		});
	}

	// ricerca per id
	static async findById(id: number): Promise<PagamentoRecord> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM pagamenti WHERE id_pagamento = ?',
				[id],
				(err: Error | null, row: PagamentoRecord) => {
					if (err) reject(err);
					else resolve(row);
				}
			);
		});
	}
}

export default Pagamento;
