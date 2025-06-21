// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';
import { AsportoRecord } from './asporto';

// Definiamo il modello di un Prenotazione
export interface PrenotazioneInput {
	numero_persone: number;
	data_ora_prenotazione: string;
	ref_cliente: number | null;
}

export interface PrenotazioneInputLoco extends PrenotazioneInput {
	otp: string | null;
	ref_torretta: number | null;
}

export interface PrenotazioneRecord extends PrenotazioneInputLoco {
	id_prenotazione: number;
}

export class Prenotazione {
	// Creazione di una nuova prenotazione online
	static async create(data: PrenotazioneInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO prenotazioni (numero_persone, data_ora_prenotazione, ref_cliente) VALUES (?, ?, ?)',
				[data.numero_persone, data.data_ora_prenotazione, data.ref_cliente],
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
	static async createLocale(data: PrenotazioneInputLoco): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO prenotazioni (numero_persone, data_ora_prenotazione, ref_cliente, otp, ref_torretta) VALUES (?, ?, ?, ?, ?)',
				[data.numero_persone, data.data_ora_prenotazione, data.ref_cliente, data.otp, data.ref_torretta],
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
	static async update(data: PrenotazioneRecord): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE prenotazioni SET numero_persone = ?, data_ora_prenotazione = ?, otp = ?, ref_cliente = ?, ref_torretta = ? WHERE id_prenotazione = ?',
				[data.numero_persone, data.data_ora_prenotazione, data.otp, data.ref_cliente, data.ref_torretta, 
				data.id_prenotazione],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante UPDATE:', err.message);
						console.error('🧾 Query params:', data.id_prenotazione);
						reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessuna prenotazione aggiornata con ID ${data.id_prenotazione}`);
						return reject(new Error(`Nessuna prenotazione trovata con ID ${data.id_prenotazione}`));
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
}


export default Prenotazione;
