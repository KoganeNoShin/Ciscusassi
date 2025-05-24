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

	// Rimozione di un Asporto
	static async deleteAsporto(id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'DELETE FROM asporti WHERE id_asporto = ?',
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

	// Aggiornamento di un Asporto
	static async updateAsporto(id: number, data: AsportoInput): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE asporti SET indirizzo = ?, data_ora_consegna = ?, ref_cliente = ?, ref_pagamento = ? WHERE id_asporto = ?',
				[data.indirizzo, data.data_ora_consegna, data.ref_cliente, data.ref_pagamento, id],
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

	// Selezione di tutti gli asporti
	static async findAll(): Promise<AsportoRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM asporti',
				(err: Error | null, rows: AsportoRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessun Asporto trovato');
						resolve([]);
					}else {
						resolve(rows);
					}
				}
			);
		});
	}
}

export default Asporto;


	/*// ricerca per id
	static async findById(id: number): Promise<AsportoRecord> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM asporti WHERE id_asporto = ?',
				[id],
				(err: Error | null, row: AsportoRecord) => {
					if (err) reject(err);
					else resolve(row);
				}
			);
		});
	}*/