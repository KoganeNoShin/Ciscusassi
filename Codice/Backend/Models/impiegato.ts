// Importa il database SQLite e il tipo di risultato per operazioni di scrittura
import { RunResult } from 'sqlite3';
import db from '../db';

// Importa bcryptjs per il confronto sicuro tra password
import bcrypt from 'bcryptjs';

/**
 * Dati generali di un impiegato (senza credenziali).
 */
export interface ImpiegatoData {
	/** Nome dell’impiegato */
	nome: string;
	/** Cognome dell’impiegato */
	cognome: string;
	/** Ruolo dell’impiegato (es: cameriere, chef, ecc.) */
	ruolo: string;
	/** Base64 dell'immagine/foto dell'impiegato */
	foto: string;
	/** Data di nascita dell’impiegato */
	data_nascita: string;
	/** ID della filiale a cui è assegnato l’impiegato */
	ref_filiale: number;
}

/**
 * Credenziali dell'impiegato per login e autenticazione.
 */
export interface ImpiegatoCredentials {
	/** Email utilizzata per il login */
	email: string;
	/** Password hashata salvata nel DB */
	password: string;
}

/**
 * Input completo richiesto alla creazione di un impiegato.
 */
export interface ImpiegatoInput extends ImpiegatoData, ImpiegatoCredentials {}

/**
 * Record completo restituito dal database per un impiegato.
 */
export interface ImpiegatoRecord extends ImpiegatoData {
	/** Email dell’impiegato */
	email: string;
	/** Matricola univoca (primary key) */
	matricola: number;
}

/**
 * Classe `Impiegato` che gestisce tutte le operazioni relative agli impiegati nel database.
 */
export class Impiegato {
	/**
	 * Crea un nuovo impiegato nel database.
	 *
	 * @param data - Dati completi dell'impiegato da inserire
	 * @returns ID (matricola) del nuovo impiegato
	 */
	static async create(data: ImpiegatoInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO impiegati (nome, cognome, ruolo, foto, email, data_nascita, password, ref_filiale) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
				[data.nome, data.cognome, data.ruolo, data.foto, data.email, data.data_nascita, data.password, data.ref_filiale],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante INSERT:', err.message);
						reject(err);
					} else resolve(this.lastID);
				}
			);
		});
	}

	/**
	 * Aggiorna le informazioni di un impiegato dato l’ID (matricola).
	 *
	 * @param data - Nuovi dati dell’impiegato
	 * @param matricola - Identificativo dell’impiegato
	 */
	static async updateImpiegato(data: ImpiegatoData, matricola: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				`UPDATE impiegati 
				SET nome = ?, cognome = ?, ruolo = ?, foto = ?, data_nascita = ?, ref_filiale = ? 
				WHERE matricola = ?`,
				[data.nome, data.cognome, data.ruolo, data.foto, data.data_nascita, data.ref_filiale, matricola],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante UPDATE:', err.message);
						console.error('🧾 Query params:', matricola);
						reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessun impiegato aggiornato con matricola ${matricola}`);
						return reject(new Error(`Nessun impiegato trovato con matricola ${matricola}`));
					} else resolve();
				}
			);
		});
	}

	/**
	 * Elimina un impiegato dal database tramite matricola.
	 *
	 * @param matricola - Identificativo dell’impiegato da eliminare
	 */
	static async deleteImpiegato(matricola: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'DELETE FROM impiegati WHERE matricola = ?',
				[matricola],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante DELETE: ', err.message);
						reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessun impiegato eliminato con matricola ${matricola}`);
						return reject(new Error(`Nessun impiegato trovato con matricola ${matricola}`));
					} else resolve();
				}
			);
		});
	}

	/**
	 * Restituisce tutti gli impiegati associati a una determinata filiale.
	 *
	 * @param id_filiale - ID della filiale
	 * @returns Lista di impiegati della filiale
	 */
	static async getByFiliale(id_filiale: number): Promise<ImpiegatoRecord[] | null> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT matricola, nome, cognome, ruolo, foto, email, data_nascita, ref_filiale FROM impiegati WHERE ref_filiale = ?',
				[id_filiale],
				(err: Error | null, rows: ImpiegatoRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessun Impiegato trovato');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	/**
	 * Recupera un impiegato tramite la sua email.
	 *
	 * @param email - Email dell’impiegato
	 * @returns Record dell’impiegato oppure `null`
	 */
	static async getByEmail(email: string): Promise<ImpiegatoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT matricola, nome, cognome, ruolo, foto, email, data_nascita, ref_filiale FROM impiegati WHERE email = ?',
				[email],
				(err: Error | null, row: ImpiegatoRecord) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.log('⚠️ [DB WARNING] Nessun Prodotto trovato');
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}

	/**
	 * Recupera un impiegato tramite matricola.
	 *
	 * @param id - Matricola dell’impiegato
	 * @returns Dati dell’impiegato oppure `null`
	 */
	static async getByMatricola(id: number): Promise<ImpiegatoData | null> {
		return new Promise((resolve, reject) => {
			db.get(
				`SELECT matricola, nome, cognome, ruolo, foto, email, data_nascita, ref_filiale 
				FROM impiegati 
				WHERE matricola = ?`,
				[id],
				(err: Error | null, row: ImpiegatoData) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.log('⚠️ [DB WARNING] Nessun Impiegato trovato');
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}

	// ------------------ ZONA CREDENZIALI ------------------ //

	/**
	 * Aggiorna il token associato a un impiegato.
	 *
	 * @param matricola - Matricola dell’impiegato
	 * @param token - Nuovo token da associare
	 * @returns Token aggiornato
	 */
	static async updateToken(matricola: number, token: string): Promise<string> {
		return new Promise((resolve, reject) => {
			db.run('UPDATE impiegati SET token = ? WHERE matricola = ?', [token, matricola], function (this: RunResult, err: Error) {
				if (err) {
					console.error('❌ [DB ERROR] updateToken:', err.message, '| Params:', { matricola, token });
					return reject(err);
				}
				if (this.changes === 0) {
					console.warn(`⚠️ [DB WARNING] updateToken: Nessun token aggiornato per impiegato con matricola ${matricola}`);
					return reject(new Error(`Nessun token aggiornato per impiegato con matricola ${matricola}`));
				}
				return resolve(token);
			});
		});
	}

	/**
	 * Recupera un impiegato tramite token salvato nel DB.
	 *
	 * @param token - Token associato all’impiegato
	 * @returns Record dell’impiegato oppure `null`
	 */
	static async getByToken(token: string): Promise<ImpiegatoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get('SELECT matricola, nome, cognome, ruolo, foto, email, data_nascita, ref_filiale FROM impiegati WHERE token = ?', [token], (err: Error, row: ImpiegatoRecord) => {
				if (err) {
					console.error('❌ [DB ERROR] getByToken:', err.message, '| Token:', token);
					return reject(err);
				}
				return resolve(row || null);
			});
		});
	}

	/**
	 * Recupera email e password hashata dell’impiegato tramite email.
	 *
	 * @param email - Email da cercare
	 * @returns Oggetto con email e password oppure `null`
	 */
	static async getPassword(email: string): Promise<ImpiegatoCredentials | null> {
		return new Promise((resolve, reject) => {
			db.get('SELECT impiegati.email, impiegati.password FROM impiegati WHERE email = ?', [email], (err: Error, row: ImpiegatoCredentials) => {
				if (err) {
					console.error('❌ [DB ERROR] getPassword:', err.message, '| Email:', email);
					return reject(err);
				}
				return resolve(row || null);
			});
		});
	}

	/**
	 * Invalida (rimuove) il token dell’impiegato, ad esempio durante il logout.
	 *
	 * @param matricola - Matricola dell’impiegato
	 */
	static async invalidateToken(matricola: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run('UPDATE impiegati SET token = NULL WHERE matricola = ?', [matricola], (err: Error) => {
				if (err) {
					console.error('❌ [DB ERROR] invalidateToken:', err.message, '| Matricola:', matricola);
					return reject(err);
				}
				resolve();
			});
		});
	}

	/**
	 * Confronta la password inserita con quella salvata nel database.
	 *
	 * @param candidatePassword - Password fornita dall'utente
	 * @param hash - Password salvata nel DB (hash)
	 * @returns `true` se la password combacia, `false` altrimenti
	 */
	static async comparePassword(candidatePassword: string, hash: string): Promise<boolean> {
		return bcrypt.compare(candidatePassword, hash);
	}

	/**
	 * Aggiorna la password di un impiegato nel database.
	 *
	 * @param matricola - Matricola dell’impiegato
	 * @param nuovaPassword - Password nuova hashata
	 */
	static async aggiornaPassword(matricola: number, nuovaPassword: string): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(`
				UPDATE impiegati
				SET password = ?
				WHERE matricola = ?
			`, [nuovaPassword, matricola], 
			function (err: Error | null) {
				if (err) {
					console.error('❌ [ImpiegatoModel ERROR] aggiornaPassword:', err.message);
					return reject(err);
				}
				resolve();
			});
		});
	}
}

export default Impiegato;