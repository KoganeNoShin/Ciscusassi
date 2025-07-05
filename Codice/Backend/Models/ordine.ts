// Importa librerie necessarie
import { rejects } from 'assert';
import db from '../db';
import { RunResult } from 'sqlite3';

/**
 * Input richiesto per la creazione di un ordine.
 */
export interface OrdineInput {
	/** Username di chi ha effettuato l’ordine */
	username_ordinante: string;
	/** ID della prenotazione associata */
	ref_prenotazione: number;
	/** ID cliente se autenticato, null se guest */
	ref_cliente: number | null;
}

/**
 * Rappresenta un record completo dell'ordine nel database.
 */
export interface OrdineRecord extends OrdineInput {
	/** ID univoco dell'ordine (primary key) */
	id_ordine: number;
	/** Riferimento al pagamento associato all’ordine (può essere null) */
	ref_pagamento: number | null;
}

/**
 * Classe che gestisce tutte le operazioni CRUD relative agli ordini.
 */
export class Ordine {
	/**
	 * Crea un nuovo ordine nel database.
	 * 
	 * @param data - Dati dell’ordine da inserire
	 * @returns ID del nuovo ordine creato
	 */
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

	/**
	 * Associa un pagamento a un ordine esistente.
	 * 
	 * @param ref_pagamento - ID del pagamento
	 * @param id_ordine - ID dell’ordine da aggiornare
	 */
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

	/**
	 * Elimina un ordine dal database.
	 * 
	 * @param id - ID dell’ordine da eliminare
	 */
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

	/**
	 * Restituisce tutti gli ordini presenti nel sistema.
	 * 
	 * @returns Array di ordini
	 */
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

	/**
	 * Restituisce un ordine specifico tramite ID.
	 * 
	 * @param id - ID dell’ordine
	 * @returns Record dell’ordine oppure null
	 */
	static async getById(id: number): Promise<OrdineRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM ordini WHERE id_ordine = ?',
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

	/**
	 * Restituisce tutti gli ordini associati a un cliente.
	 * 
	 * @param clienteId - ID del cliente
	 * @returns Lista di ordini del cliente
	 */
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

	/**
	 * Restituisce tutti gli ordini associati a una prenotazione.
	 * 
	 * @param prenotazioneId - ID della prenotazione
	 * @returns Lista di ordini associati
	 */
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

	/**
	 * Restituisce l'ID dell’ordine associato a una combinazione unica di prenotazione e username.
	 * 
	 * @param prenotazioneID - ID della prenotazione
	 * @param username - Username dell'ordinante
	 * @returns ID dell’ordine oppure null
	 */
	static async getOrdineByPrenotazioneAndUsername(prenotazioneID: number, username: string): Promise<number | null> {
		return new Promise((resolve, reject) => {
			db.get(
				`SELECT *
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

// Esporta la classe Ordine come default per l'utilizzo nei controller
export default Ordine;