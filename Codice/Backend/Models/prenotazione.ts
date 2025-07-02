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

export interface PrenotazioneWithUtente extends PrenotazioneRecord {
	utente: {
		nome: string;
		cognome: string;
	};
}

export interface PrenotazioneWithFiliale extends PrenotazioneRecord {
	id_filiale: number;
	indirizzo: string;
	comune: string;
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
	static async getByCliente(ref_cliente: number): Promise<PrenotazioneWithFiliale[]> {
		return new Promise((resolve, reject) => {
			db.all(`
				SELECT 
					p.id_prenotazione, 
					p.numero_persone, 
					p.data_ora_prenotazione, 
					p.ref_cliente, 
					p.ref_torretta, 
					p.otp, 
					f.id_filiale, 
					f.indirizzo, 
					f.comune
				FROM 
					prenotazioni p
				JOIN 
					torrette t ON p.ref_torretta = t.id_torretta
				JOIN 
					filiali f ON t.ref_filiale = f.id_filiale
				WHERE 
					p.ref_cliente = ?
				`,[ref_cliente],
				(err: Error | null, rows: PrenotazioneWithFiliale[]) => {
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

	// Recupera prenotazioni del giorno per filiale
	static async getPrenotazioniDataAndFiliale(id_filiale: number, data: string): Promise<PrenotazioneWithUtente[]> {
		return new Promise((resolve, reject) => {
			db.all(`
            SELECT 
				p.id_prenotazione, 
				p.numero_persone, 
				p.data_ora_prenotazione,
				p.ref_torretta,
				c.nome, 
				c.cognome
			FROM 
				prenotazioni p
			JOIN 
				torrette t ON p.ref_torretta = t.id_torretta
			LEFT JOIN 
				clienti c ON p.ref_cliente = c.numero_carta
			WHERE 
				DATE(p.data_ora_prenotazione) = ?
				AND t.ref_filiale = ?
			`,[data, id_filiale],
				(err: Error | null, rows: PrenotazioneWithUtente[]) => {
						if (err) {
							console.error('❌ [DB ERROR] Errore durante SELECT future:', err.message);
							reject(err);
						} else resolve(rows);
					}
				);
			});
	}

	static async confermaPrenotazione(id_prenotazione: number, otp: string): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE prenotazioni SET otp = ? WHERE id_prenotazione = ?',
				[otp, id_prenotazione],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante conferma prenotazione:', err.message);
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

	static async getOTPById(id_prenotazione: number): Promise<string | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT otp FROM prenotazioni WHERE id_prenotazione = ?',
				[id_prenotazione],
				(err: Error | null, row: { otp: string | null } | undefined) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT OTP:', err.message);
						reject(err);
					} else if (!row) {
						console.warn(`⚠️ [DB WARNING] Nessuna prenotazione trovata con ID ${id_prenotazione}`);
						resolve(null);
					} else resolve(row.otp);
				}
			);
		});
	}

	static async getByDataETorretta(data_ora_prenotazione: string, ref_torretta: number): Promise<PrenotazioneRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM prenotazioni WHERE data_ora_prenotazione = ? AND ref_torretta = ?',
				[data_ora_prenotazione, ref_torretta],
				(err: Error | null, row: PrenotazioneRecord | undefined) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT per data e torretta:', err.message);
						reject(err);
					} else if (!row) {
						console.warn(`⚠️ [DB WARNING] Nessuna prenotazione trovata per data ${data_ora_prenotazione} e torretta ${ref_torretta}`);
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}
}

export default Prenotazione;