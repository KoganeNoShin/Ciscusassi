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

// Definiamo il modello del nostro utente
export interface ClienteData extends ClienteCredentials {
	nome: string;
	cognome: string;
	data_nascita: string;
	punti?: number;
	image: string;
}

export interface ClienteRecord extends ClienteData {
	numero_carta: number;
}

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class Cliente {
	static async updateToken(numeroCarta: number): Promise<string> {
		const token = crypto.randomBytes(64).toString('hex'); // 128 caratteri random

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
	static async create(data: ClienteData): Promise<number> {
		// Definiamo i campi come quelli presi dal data passato come parametro
		const { nome, cognome, data_nascita, email, password, image } = data;
		const punti = data.punti || 0; // Se non viene passato il campo punti, lo inizializziamo a 0

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO clienti (nome, cognome, data_nascita, email, password, punti, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
				[
					nome,
					cognome,
					data_nascita,
					email,
					hashedPassword,
					punti,
					image,
				],
				function (this: RunResult, err: Error) {
					if (err) return reject(err);
					else resolve(this.lastID);
				}
			);
		});
	}

	// definiamo il metodo per ritornare tutti i clienti
	static async findAll(): Promise<ClienteRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM clienti',
				(err: Error | null, rows: ClienteRecord[]) => {
					if (err) return reject(err);
					else resolve(rows);
				}
			);
		});
	}

	// definisco il metodo per trovare un utente in base all'username
	static async findByEmail(email: string): Promise<ClienteRecord> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM clienti WHERE email = ?',
				[email],
				(err: Error | null, row: ClienteRecord) => {
					if (err) reject(err);
					else resolve(row);
				}
			);
		});
	}

	// ricerca per numero_carta
	static async findByNumeroCarta(
		numero_carta: number
	): Promise<ClienteRecord> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM clienti WHERE numero_carta = ?',
				[numero_carta],
				(err: Error, row: ClienteRecord) => {
					if (err) reject(err);
					else resolve(row);
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
}

export default Cliente;
