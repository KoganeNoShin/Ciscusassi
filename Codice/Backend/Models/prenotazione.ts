// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello di un Prenotazione
export interface PrenotazioneInput {
	numero_persone: number;
	data_ora_prenotazione: string;
	ref_cliente: number | null;
	ref_torretta: number;
}

export interface PrenotazioneRecord extends PrenotazioneInput {
	id_prenotazione: number;
	otp: string | null;
}

export class Prenotazione {
	// Creazione di una nuova prenotazione online
	static async create(data: PrenotazioneInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO prenotazioni (numero_persone, data_ora_prenotazione, ref_cliente, ref_torretta) VALUES (?, ?, ?, ?)',
				[data.numero_persone, data.data_ora_prenotazione, data.ref_cliente, data.ref_torretta],
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

	// Creazione di una nuova prenotazione in loco
	static async createLocale(data: PrenotazioneInput, otp: string): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO prenotazioni (numero_persone, data_ora_prenotazione, ref_cliente, otp, ref_torretta) VALUES (?, ?, ?, ?, ?)',
				[data.numero_persone, data.data_ora_prenotazione, data.ref_cliente, otp, data.ref_torretta],
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

	// Modifica Prenotazione
	static async update(id_prenotazione: number, numero_persone: number, data_ora_prenotazione: string): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE prenotazioni SET numero_persone = ?, data_ora_prenotazione = ? WHERE id_prenotazione = ?',
				[numero_persone, data_ora_prenotazione, 
				id_prenotazione],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante UPDATE:', err.message);
						console.error('🧾 Query params:', id_prenotazione);
						reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessuna prenotazione aggiornata con ID ${id_prenotazione}`);
						return reject(new Error(`Nessuna prenotazione trovata con ID ${id_prenotazione}`));
					}
					else resolve();
				}
			);
		});
	}

	// Elimina Prenotazione
	static async delete(id_prenotazione: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'DELETE FROM prenotazioni WHERE id_prenotazione = ?',
				[id_prenotazione],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante DELETE:', err.message);
						reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessuna prenotazione eliminata con ID ${id_prenotazione}`);
						return reject(new Error(`Nessuna prenotazione trovata con ID ${id_prenotazione}`));
					}
					else resolve();
				}
			);
		});
	}

	// Recupera tutte le prenotazioni
	static async getAll(): Promise<PrenotazioneRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM prenotazioni',
				[],
				(err: Error | null, rows: PrenotazioneRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessuna prenotazione trovato');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	// Recupera prenotazione per ID
	static async getById(id_prenotazione: number): Promise<PrenotazioneRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM prenotazioni WHERE id_prenotazione = ?',
				[id_prenotazione],
				(err: Error | null, row: PrenotazioneRecord | undefined) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.warn(`⚠️ [DB WARNING] Nessuna prenotazione trovata con ID ${id_prenotazione}`);
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}

	// Recupera prenotazioni per cliente
	static async getByCliente(ref_cliente: number): Promise<PrenotazioneRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM prenotazioni WHERE ref_cliente = ?',
				[ref_cliente],
				(err: Error | null, rows: PrenotazioneRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn(`⚠️ [DB WARNING] Nessuna prenotazione trovata per cliente ${ref_cliente}`);
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	// Recupera prenotazioni del giorno
	static async getPrenotazioniDelGiornoFiliale(id_filiale: number): Promise<PrenotazioneRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(`
				SELECT p.*
				FROM prenotazioni p
				JOIN ordini o ON p.id_prenotazione = o.ref_prenotazione
				JOIN torrette t ON p.ref_torretta = t.id_torretta
				WHERE o.ref_pagamento IS NOT NULL
				AND DATE(p.data_ora_prenotazione) = DATE('now')
				AND t.ref_filiale = ?`,
				[id_filiale],
				(err: Error | null, rows: PrenotazioneRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT del giorno:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessuna prenotazione trovato del giorno');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	static async getPrenotazioniAttualiEFuture(): Promise<PrenotazioneRecord[]> {
	return new Promise((resolve, reject) => {
		db.all(
			`
			SELECT * FROM prenotazioni
			WHERE DATE(data_ora_prenotazione) >= DATE('now')
			`,
			[],
			(err: Error | null, rows: PrenotazioneRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT future:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessuna prenotazione trovata');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}
}


export default Prenotazione;
