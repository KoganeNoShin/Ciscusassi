// importo il db
import { RunResult } from 'sqlite3';
import db from '../db';

// importo il modulo bcryptjs per la gestione delle password
import bcrypt from 'bcryptjs';

// Definiamo il modello dell'impiegato
export interface ImpiegatoData {
	nome: string;
	cognome: string;
	ruolo: string;
	foto: string;
	data_nascita: string;
	ref_filiale: number;
}

export interface ImpiegatoCredentials {
	email: string;
	password: string;
}

export interface ImpiegatoInput extends ImpiegatoData, ImpiegatoCredentials {}

export interface ImpiegatoRecord extends ImpiegatoData {
	email: string;
	matricola: number;
}

export class Impiegato {
	// Creazione di un nuovo Impiegato
	static async create(data: ImpiegatoInput): Promise<number> {
		const password = data.password;

		// genSalt genera un seed casuale per l'hashing della password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO impiegati (nome, cognome, ruolo, foto, email, data_nascita, password, ref_filiale) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
				[data.nome, data.cognome, data.ruolo, data.foto, data.email, data.data_nascita, hashedPassword, data.ref_filiale],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante INSERT:', err.message);
						reject(err);
					} else resolve(this.lastID);
				}
			);
		});
	}

	// Modifica Impiegato
	static async updateImpiegato(data: ImpiegatoData, matricola: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				`UPDATE impiegati 
				SET nome = ?, cognome = ?, ruolo = ?, foto = ?, data_nascita = ?, ref_filiale = ? 
				WHERE matricola = ?`,
				[data.nome, data.cognome, data.ruolo, data.foto, data.data_nascita, data.ref_filiale,
				matricola],
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

	// Elimina Impiegato
	static async deleteImpiegato(matricola: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'DELETE FROM impiegati WHERE matricola = ?',
				[matricola],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante DELETE: ',err.message);
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

	// Seleziona tutti gli Impiegati
	static async getByFiliale(id_filiale: number): Promise<ImpiegatoRecord[] | null> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM impiegati WHERE ref_filiale = ?',
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

	// Seleziona in base all'email
	static async getByEmail(email: string): Promise<ImpiegatoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM impiegati WHERE email = ?',
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

	// Seleziona in base all'ID
	static async getByMatricola(id: number): Promise<ImpiegatoData | null> {
		return new Promise((resolve, reject) => {
			db.get(
				`SELECT nome, cognome, ruolo, foto, data_nascita, ref_filiale 
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

	//------------------ ZONA CREDENZIALI ------------------//

	// Aggiornamento Token Impiegato
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

	// Seleziona le credenziali dell'impiegato in base al token
	static async getByToken(token: string): Promise<ImpiegatoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get('SELECT * FROM impiegati WHERE token = ?', [token], (err: Error, row: ImpiegatoRecord) => {
				if (err) {
					console.error('❌ [DB ERROR] getByToken:', err.message, '| Token:', token);
					return reject(err);
				}
				return resolve(row || null);
			});
		});
	}

	// Seleziona le credenziali dell'impiegato in base all'email
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

	// Invalida il token dell'impiegato
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

	// Confronta la password inserita con quella salvata nel database
	static async comparePassword(candidatePassword: string, hash: string): Promise<boolean> {
		return bcrypt.compare(candidatePassword, hash);
	}
}

export default Impiegato;
