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

	// Rimozione di un Pagamento
	static async deletePagamento(id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'DELETE FROM pagamenti WHERE id_pagamento = ?',
				[id],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante DELETE:', err.message);
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}

	// Aggiornamento di un Pagamento
	static async updatePagamento(id: number, data: PagamentoInput): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE pagamenti SET importo = ?, data_ora_pagamento = ? WHERE id_pagamento = ?',
				[data.importo, data.data_ora_pagamento, id],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante UPDATE:', err.message);
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});
	}
	
	// Seleziona per id
	static async findById(id: number): Promise<PagamentoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM pagamenti WHERE id_pagamento = ?',
				[id],
				(err: Error | null, row: PagamentoRecord) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.warn('⚠️ [DB WARNING] Nessun Asporto trovato');
						resolve(null);
					}else {
						resolve(row);
					}
				}
			);
		});
	}

	// Ricerca tutti i pagamenti
	static async findAll(): Promise<PagamentoRecord[]> {
		return new Promise((resolve, reject) => {
			db.all('SELECT * FROM pagamenti', (err: Error | null, rows: PagamentoRecord[]) => {
				if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessun piatto trovato');
						resolve([]);
					}else {
						resolve(rows);
					}
			});
		});
	}
}

export default Pagamento;