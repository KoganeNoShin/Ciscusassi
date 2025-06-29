// importo il db
import { rejects } from 'assert';
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello di un Ordine
export interface OrdineInput {
	username_ordinante: string;
	ref_prenotazione: number;
	ref_cliente: number | null;
}
export interface OrdineRecord extends OrdineInput {
	id_ordine: number;
	ref_pagamento: number | null;
}

export class Ordine {
	// Creazione di un nuovo Ordine
	static async create(data: OrdineInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO ordini (username_ordinante, ref_prenotazione, ref_cliente) VALUES (?, ?, ?)',
				[data.username_ordinante, data.ref_prenotazione, data.ref_cliente],
				function (err) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante INSERT:', err.message);
						reject(err);
					}
					else resolve(this.lastID);
				}
			);
		});
	}

	// Aggiunta di un Pagamento a un Ordine
	static async addPagamento(ref_pagamento : number, id_ordine: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE ordini SET ref_pagamento = ? WHERE id_ordine = ?',
				[ref_pagamento, id_ordine],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante UPDATE:', err.message);
						console.error('🧾 Query params:', id_ordine);
						reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessun ordine aggiornato con ID ${id_ordine}`);
						return reject(new Error(`Nessun ordine trovato con ID ${id_ordine}`));
					}
					else resolve();
				}
			);
		});
	}


	// Elimina Piatto
	static async deleteOrdine(id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'DELETE FROM ordini WHERE id_ordine = ?',
				[id],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante DELETE:', err.message);
						console.error('🧾 Query params:', id);
						reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessun ordine eliminato con ID ${id}`);
						return reject(new Error(`Nessun ordine trovato con ID ${id}`));
					}
					else resolve();
				}
			);
		});
	}

	// Selezione di tutti gli Ordini
	static async getAll(): Promise<OrdineRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM ordini',
				(err: Error | null, rows: OrdineRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessun ordine trovato');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	// Selezione di un Ordine per ID
	static async getById(id: number): Promise<OrdineRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM pagamenti WHERE id_pagamento = ?',
				[id],
				(err: Error | null, row: OrdineRecord) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.log('⚠️ [DB WARNING] Nessun Ordine trovato');
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}

	// Selezione di Ordini per Cliente
	static async getByCliente(clienteId: number): Promise<OrdineRecord[] | null> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM ordini WHERE ref_cliente = ?',
				[clienteId],
				(err: Error | null, rows: OrdineRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessun ordine trovato per il cliente');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	// Selezione di Ordini per Prenotazione
	static async getByPrenotazione(prenotazioneId: number): Promise<OrdineRecord[] | null> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM ordini WHERE ref_prenotazione = ?',
				[prenotazioneId],
				(err: Error | null, rows: OrdineRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessun ordine trovato per la prenotazione');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	// Selezione di Ordini per Prenotazione e Username (Copia univoca tramite validate)
	static async getIDOrdineByPrenotazioneAndUsername(prenotazioneID: number, username: string): Promise<number | null> {
		return new Promise((resolve, reject) => {
			db.get(
				`SELECT id_ordine
				FROM ordini
				WHERE ref_prenotazione = ? AND
					username_ordinante = ?`, 
				[prenotazioneID, username],
				(err: Error | null, row: number) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.log('⚠️ [DB WARNING] Nessun Ordine trovato');
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}
}

export default Ordine;
