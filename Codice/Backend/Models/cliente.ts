// importo il db
import { RunResult } from 'sqlite3';
import db from '../db';
import crypto from 'crypto';

// importo il modulo bcryptjs per la gestione delle password
import bcrypt from 'bcryptjs';

export interface ClienteCredentials {
	email: string;
	password: string;
}

// Definiamo il modello del nostro Cliente
export interface ClienteData extends ClienteCredentials {
	nome: string;
	cognome: string;
	data_nascita: string;
	image: string;
}

export interface ClienteRecord extends ClienteData {
	numero_carta: number;
	punti: number;
}

class Cliente {
	static async create(data: ClienteData): Promise<number> {
		const { nome, cognome, data_nascita, email, password, image } = data;

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO clienti (nome, cognome, data_nascita, email, password, punti, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
				[nome, cognome, data_nascita, email, hashedPassword, 0, image],
				function (this: RunResult, err: Error) {
					if (err) return reject(err);
					else resolve(this.lastID);
				}
			);
		});
	}

	static async updateToken(
		numeroCarta: number,
		token: string
	): Promise<string> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE clienti SET token = ? WHERE numero_carta = ?',
				[token, numeroCarta],
				function (this: RunResult, err: Error) {
					if (err) return reject(err);
					resolve(token);
				}
			);
		});
	}

	// definisco il metodo per creare un nuovo utente

	// definiamo il metodo per ritornare tutti i clienti
	static async findAll(): Promise<ClienteRecord[] | null> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM clienti',
				(err: Error | null, rows: ClienteRecord[]) => {
					if (err) return reject(err);
					if (!rows) return resolve(null);
					return resolve(rows);
				}
			);
		});
	}

	// definisco il metodo per trovare un utente in base all'username
	static async findByEmail(email: string): Promise<ClienteRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM clienti WHERE email = ?',
				[email],
				(err: Error | null, row: ClienteRecord) => {
					if (err) return reject(err);
					if (!row) return resolve(null);
					return resolve(row);
				}
			);
		});
	}

	// ricerca per numero_carta
	static async findByNumeroCarta(
		numero_carta: number
	): Promise<ClienteRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM clienti WHERE numero_carta = ?',
				[numero_carta],
				(err: Error, row: ClienteRecord) => {
					if (err) return reject(err);
					if (!row) return resolve(null);
					return resolve(row);
				}
			);
		});
	}

	static async findByToken(token: string): Promise<ClienteRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM clienti WHERE token = ?',
				[token],
				(err: Error, row: ClienteRecord) => {
					if (err) return reject(err);
					if (!row) return resolve(null);
					return resolve(row);
				}
			);
		});
	}

	static async invalidateToken(numero_carta: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE clienti SET token = NULL WHERE numero_carta = ?',
				[numero_carta],
				(err: Error | null) => {
					if (err) reject(err);
					else resolve();
				}
			);
		});
	}

	// confronta la password inserita con quella salvata nel db
	static async comparePassword(
		candidatePassword: string,
		hash: string
	): Promise<boolean> {
		return bcrypt.compare(candidatePassword, hash);
	}

	static async login(email: string, password: string) {
		const user = await this.findByEmail(email);

		if (!user)
			// Se l'utente non esiste ritorna falso
			return false;

		// Se la password è corretta ritorna vero
		return this.comparePassword(password, user.password);
	}

	static async getPoints(token: string): Promise<number> {
		const user = await this.findByToken(token);

		if (!user) {
			throw new Error('Utente non trovato o token non valido');
		}

		return user.punti;
	}
}

export default Cliente;
