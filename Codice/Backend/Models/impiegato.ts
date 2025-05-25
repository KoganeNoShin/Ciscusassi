// importo il db
import { RunResult } from 'sqlite3';
import db from '../db';

// importo il modulo bcryptjs per la gestione delle password
import bcrypt from 'bcryptjs';

import crypto from 'crypto';

// Definiamo il modello dell'impiegatp
export interface ImpiegatoInput {
	nome: string;
	cognome: string;
	ruolo: string;
	foto: string;
	email: string;
	data_nascita: string;
	password: string;
	ref_filiale: number;
}

export interface ImpiegatoRecord extends ImpiegatoInput {
	matricola: number;
}

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
export class Impiegato {
	static async updateToken(numeroCarta: number): Promise<string> {
		const token = crypto.randomBytes(64).toString('hex'); // 128 caratteri random

		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE impiegati SET token = ? WHERE matricola = ?',
				[token, numeroCarta],
				function (this: RunResult, err: Error) {
					if (err) return reject(err);
					else return resolve(token);
				}
			);
		});
	}

	// definisco il metodo per creare un nuovo utente
	static async create(data: ImpiegatoInput) {
		const {
			nome,
			cognome,
			ruolo,
			foto,
			email,
			data_nascita,
			password,
			ref_filiale,
		} = data;

		// genSalt genera un seed casuale per l'hashing della password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO impiegati (nome, cognome, ruolo, foto, email, data_nascita, password, ref_filiale) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
				[
					nome,
					cognome,
					ruolo,
					foto,
					email,
					data_nascita,
					hashedPassword,
					ref_filiale,
				],
				function (this: RunResult, err: Error | null) {
					if (err) return reject(err);
					else return resolve(this.lastID);
				}
			);
		});
	}

	static async findAll(): Promise<ImpiegatoRecord[] | null> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM impiegati',
				(err: Error | null, rows: ImpiegatoRecord[]) => {
					if (err) return reject(err);
					if (!rows) return resolve(null);
					return resolve(rows);
				}
			);
		});
	}

	// ricerca per id
	static async findByMatricola(
		matricola: string
	): Promise<ImpiegatoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM impiegati WHERE matricola = ?',
				[matricola],
				(err: Error | null, row: ImpiegatoRecord) => {
					if (err) return reject(err);
					if (!row) return resolve(null);
					return resolve(row);
				}
			);
		});
	}

	static async findByToken(token: string): Promise<ImpiegatoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM impiegati WHERE token = ?',
				[token],
				(err: Error, row: ImpiegatoRecord) => {
					if (err) return reject(err);
					if (!row) return resolve(null);
					return resolve(row);
				}
			);
		});
	}

	// definisco il metodo per trovare un utente in base all'username
	static async findByEmail(email: string): Promise<ImpiegatoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM impiegati WHERE email = ?',
				[email],
				(err: Error | null, row: ImpiegatoRecord) => {
					if (err) return reject(err);
					if (!row) return resolve(null);
					return resolve(row);
				}
			);
		});
	}

	static async invalidateToken(matricola: string): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE impiegati SET token = NULL WHERE matricola = ?',
				[matricola],
				(err: Error | null) => {
					if (err) reject(err);
					else resolve();
				}
			);
		});
	}

	// confronta la password inserita con quella salvata nel db
	static async comparePassword(candidatePassword: string, hash: string) {
		return bcrypt.compare(candidatePassword, hash);
	}
}

export default Impiegato;
