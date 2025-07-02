import { RunResult } from 'sqlite3';
import db from '../db';
import bcrypt from 'bcryptjs';

// Modello delle credenziali per login
export interface ClienteCredentials {
	email: string;
	password: string;
}

// Input per la creazione di un nuovo cliente
export interface ClienteData extends ClienteCredentials {
	nome: string;
	cognome: string;
	data_nascita: string;
	image: string;
}

// Record completo del cliente
export interface ClienteRecord extends ClienteData {
	numero_carta: number;
	punti: number;
}

class Cliente {
	// Crea un nuovo Cliente nel database
	static async create(data: ClienteData): Promise<number> {
		const { nome, cognome, data_nascita, email, password, image } = data;

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO clienti (nome, cognome, data_nascita, email, password, punti, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
				[nome, cognome, data_nascita, email, hashedPassword, 0, image],
				function (this: RunResult, err: Error) {
					if (err) {
						console.error('❌ [DB ERROR] createCliente:', err.message, '| Params:', data);
						return reject(err);
					}
					resolve(this.lastID);
				}
			);
		});
	}

	// Aggiorna il token del cliente
	static async updateToken(numeroCarta: number, token: string): Promise<string> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE clienti SET token = ? WHERE numero_carta = ?',
				[token, numeroCarta],
				function (this: RunResult, err: Error) {
					if (err) {
						console.error('❌ [DB ERROR] updateToken:', err.message, '| Params:', { numeroCarta, token });
						return reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] updateToken: Nessun token aggiornato per cliente con numero carta ${numeroCarta}`);
						return reject(new Error(`Nessun cliente trovato con numero carta ${numeroCarta}`));
					}
					resolve(token);
				}
			);
		});
	}

	// Restituisce i punti di un cliente dato l'ID
	static async getPuntiCliente(idCliente: number): Promise<number> {
		return new Promise((resolve, reject) => {
			const query = 'SELECT punti FROM clienti WHERE numero_carta = ?';
			db.get(query, [idCliente], (err: Error | null, row: { punti: number }) => {
				if (err) {
					console.error('❌ [DB ERROR] getPuntiCliente:', err.message);
					return reject(err);
				}
				if (!row) {
					console.warn('⚠️ [DB WARNING] getPuntiCliente: Cliente non trovato');
					return resolve(0); // Restituisce 0 se il cliente non esiste
				}
				resolve(row.punti);
			});
		});
	}

	// Aggiorna i punti di un cliente dato l'ID
	static async setPuntiCliente(idCliente: number, nuoviPunti: number): Promise<void> {
		return new Promise((resolve, reject) => {
			const query = 'UPDATE clienti SET punti = ? WHERE numero_carta = ?';
			db.run(query, [nuoviPunti, idCliente], function (err: Error | null) {
				if (err) {
					console.error('❌ [DB ERROR] setPuntiCliente:', err.message);
					return reject(err);
				}
				if (this.changes === 0) {
					console.warn('⚠️ [DB WARNING] setPuntiCliente: Cliente non trovato');
					return reject('Cliente non trovato');
				}
				resolve();
			});
		});
	}


	// Restituisce tutti i clienti
	static async getAll(): Promise<ClienteRecord[]> {
		return new Promise((resolve, reject) => {
			db.all('SELECT numero_carta, nome, cognome, data_nascita, email, punti, image FROM clienti', (err: Error | null, rows: ClienteRecord[]) => {
				if (err) {
					console.error('❌ [DB ERROR] getAll:', err.message);
					return reject(err);
				}
				if (!rows || rows.length === 0) {
					console.warn('⚠️ [DB WARNING] getAll: Nessun cliente trovato');
					return resolve([]);
				}
				resolve(rows);
			});
		});
	}

	// Restituisce un cliente in base all'email
	static async getByEmail(email: string): Promise<ClienteRecord | null> {
		return new Promise((resolve, reject) => {
			db.get('SELECT numero_carta, nome, cognome, data_nascita, email, punti, password, image FROM clienti WHERE email = ?', [email], (err: Error | null, row: ClienteRecord) => {
				if (err) {
					console.error('❌ [DB ERROR] getByEmail:', err.message, '| Email:', email);
					return reject(err);
				}
				resolve(row || null);
			});
		});
	}

	// Restituisce un cliente in base al numero carta
	static async getByNumeroCarta(numero_carta: number): Promise<ClienteRecord | null> {
		return new Promise((resolve, reject) => {
			db.get('SELECT numero_carta, nome, cognome, data_nascita, email, punti, image FROM clienti WHERE numero_carta = ?', [numero_carta], (err: Error, row: ClienteRecord) => {
				if (err) {
					console.error('❌ [DB ERROR] getByNumeroCarta:', err.message, '| Numero Carta:', numero_carta);
					return reject(err);
				}
				resolve(row || null);
			});
		});
	}

	// Restituisce un cliente in base al token
	static async getByToken(token: string): Promise<ClienteRecord | null> {
		return new Promise((resolve, reject) => {
			db.get('SELECT numero_carta, nome, cognome, data_nascita, email, punti, image FROM clienti WHERE token = ?', [token], (err: Error, row: ClienteRecord) => {
				if (err) {
					console.error('❌ [DB ERROR] getByToken:', err.message, '| Token:', token);
					return reject(err);
				}
				resolve(row || null);
			});
		});
	}

	// Invalida il token del cliente
	static async invalidateToken(numero_carta: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run('UPDATE clienti SET token = NULL WHERE numero_carta = ?', [numero_carta], (err: Error | null) => {
				if (err) {
					console.error('❌ [DB ERROR] invalidateToken:', err.message, '| Numero Carta:', numero_carta);
					return reject(err);
				}
				resolve();
			});
		});
	}

	// Confronta la password inserita con quella salvata
	static async comparePassword(candidatePassword: string, hash: string): Promise<boolean> {
		return bcrypt.compare(candidatePassword, hash);
	}

	// Effettua il login controllando email e password
	static async login(email: string, password: string): Promise<boolean> {
		const user = await this.getByEmail(email);
		if (!user) return false;
		return this.comparePassword(password, user.password);
	}
}

export default Cliente;