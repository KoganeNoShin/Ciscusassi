// Importa il database SQLite
import db from '../db';
import { RunResult } from 'sqlite3';

/**
 * Input richiesto per la creazione di una nuova prenotazione.
 */
export interface PrenotazioneInput {
	/** Numero di persone per la prenotazione */
	numero_persone: number;
	/** Data e ora della prenotazione (formato ISO o datetime SQL) */
	data_ora_prenotazione: string;
	/** ID del cliente se autenticato, null se guest */
	ref_cliente: number;
	/** ID della torretta associata */
	ref_torretta: number;
}

/**
 * Record completo di una prenotazione salvata nel database.
 */
export interface PrenotazioneRecord extends PrenotazioneInput {
	/** ID univoco della prenotazione */
	id_prenotazione: number;
	/** OTP generato per la conferma della prenotazione (può essere null) */
	otp: string | null;
}

/**
 * Estensione della prenotazione con dati del cliente associato.
 */
export interface PrenotazioneWithUtente extends PrenotazioneRecord {
	utente: {
		/** Nome del cliente */
		nome: string;
		/** Cognome del cliente */
		cognome: string;
	};
}

/**
 * Estensione della prenotazione con informazioni sulla filiale.
 */
export interface PrenotazioneWithFiliale extends PrenotazioneRecord {
	/** ID della filiale associata */
	id_filiale: number;
	/** Indirizzo della filiale */
	indirizzo: string;
	/** Comune della filiale */
	comune: string;
}

/**
 * Classe `Prenotazione` per la gestione delle prenotazioni nel sistema.
 */
export class Prenotazione {
	/**
	 * Crea una nuova prenotazione online.
	 * @param data - Dati della prenotazione
	 * @returns ID della prenotazione creata
	 */
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

	/**
	 * Crea una prenotazione in loco, includendo l’OTP.
	 * @param data - Dati della prenotazione
	 * @param otp - Codice OTP generato
	 * @returns ID della prenotazione creata
	 */
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

	/**
	 * Aggiorna il numero di persone e l’orario di una prenotazione esistente.
	 * @param id_prenotazione - ID della prenotazione da aggiornare.
	 * @param numero_persone - Nuovo numero di persone.
	 * @param data_ora_prenotazione - Nuova data e ora della prenotazione.
	 */
	static async update(id_prenotazione: number, numero_persone: number, data_ora_prenotazione: string): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE prenotazioni SET numero_persone = ?, data_ora_prenotazione = ? WHERE id_prenotazione = ?',
				[numero_persone, data_ora_prenotazione, id_prenotazione],
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

	/**
	 * Elimina una prenotazione esistente.
	 * @param id_prenotazione - ID della prenotazione da eliminare.
	 */
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

	/**
	 * Restituisce tutte le prenotazioni nel sistema.
	 * @returns Lista di prenotazioni.
	 */
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
						console.warn('⚠️ [DB WARNING] Nessuna prenotazione trovata');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	/**
	 * Restituisce una prenotazione tramite il suo ID.
	 * @param id_prenotazione - ID della prenotazione.
	 * @returns Record della prenotazione o `null` se non trovata.
	 */
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

	/**
	 * Restituisce l’OTP per una torretta in un determinato orario.
	 * @param id_torretta - ID della torretta.
	 * @param data - Data e ora della prenotazione.
	 * @returns Codice OTP oppure `null`.
	 */
	static async getOTPByIdTorrettaAndData(id_torretta: number, data: string): Promise<string | null> {
		return new Promise((resolve, reject) => {
			db.get(`
				SELECT p.otp 
				FROM prenotazioni p 
				WHERE data_ora_prenotazione = ? AND ref_torretta = ?`,
				[data, id_torretta],
				(err: Error | null, row: string | undefined) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.warn(`⚠️ [DB WARNING] Nessuna prenotazione trovata con ID ${id_torretta} per questo orario ${data}`);
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}

	/**
	 * Restituisce tutte le prenotazioni effettuate da un cliente.
	 * @param ref_cliente - ID del cliente.
	 * @returns Lista di prenotazioni con dettagli sulla filiale.
	 */
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
				FROM prenotazioni p
				JOIN torrette t ON p.ref_torretta = t.id_torretta
				JOIN filiali f ON t.ref_filiale = f.id_filiale
				WHERE p.ref_cliente = ?`,
				[ref_cliente],
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

	/**
	 * Restituisce le prenotazioni per una specifica data e filiale.
	 * @param id_filiale - ID della filiale.
	 * @param data - Data della prenotazione (formato 'yyyy-MM-dd').
	 * @returns Lista di prenotazioni con dettagli del cliente.
	 */
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
				FROM prenotazioni p
				JOIN torrette t ON p.ref_torretta = t.id_torretta
				LEFT JOIN clienti c ON p.ref_cliente = c.numero_carta
				WHERE DATE(p.data_ora_prenotazione) = DATE(?) AND t.ref_filiale = ?`,
				[data, id_filiale],
				(err: Error | null, rows: PrenotazioneWithUtente[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT future:', err.message);
						reject(err);
					} else resolve(rows);
				}
			);
		});
	}

	/**
	 * Conferma una prenotazione assegnando un codice OTP.
	 * @param id_prenotazione - ID della prenotazione.
	 * @param otp - Codice OTP da assegnare.
	 */
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

	/**
	 * Restituisce l'OTP associato a una prenotazione dato il suo ID.
	 *
	 * @param id_prenotazione - L'ID univoco della prenotazione.
	 * @returns Una Promise che risolve con l'OTP come stringa oppure `null` se non trovato.
	 */
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

	/**
	 * Cerca una prenotazione in base a data e torretta.
	 * @param data_ora_prenotazione - Data e ora della prenotazione.
	 * @param ref_torretta - ID della torretta.
	 * @returns Prenotazione trovata oppure `null`.
	 */
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