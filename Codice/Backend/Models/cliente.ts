import { RunResult } from 'sqlite3';
import db from '../db';
import bcrypt from 'bcryptjs';

/**
 * Interfaccia per le credenziali base del cliente usate per il login.
 */
export interface ClienteCredentials {
	/** Email del cliente */
	email: string;
	/** Password del cliente */
	password: string;
}

/**
 * Interfaccia per la creazione di un nuovo cliente.
 */
export interface ClienteData extends ClienteCredentials {
	/** Nome del cliente */
	nome: string;
	/** Cognome del cliente */
	cognome: string;
	/** Data di nascita del cliente (stringa ISO) */
	data_nascita: string;
	/** Base64 dell'immagine profilo del cliente */
	image: string;
}

/**
 * Interfaccia che rappresenta un record completo del cliente nel database.
 */
export interface ClienteRecord extends ClienteData {
	/** Numero identificativo della carta cliente (primary key) */
	numero_carta: number;
	/** Punti accumulati dal cliente */
	punti: number;
}

/**
 * Classe che gestisce tutte le operazioni relative ai clienti nel database.
 */
class Cliente {
	/**
	 * Aggiorna i dati personali del cliente.
	 *
	 * @param idCliente - Numero carta del cliente da aggiornare
	 * @param data - Dati aggiornati (parziali)
	 */
	static async update(idCliente: number, data: Partial<ClienteData>): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(`
				UPDATE clienti
				SET nome = ?, cognome = ?, email = ?, data_nascita = ?, image = ?
				WHERE numero_carta = ?
				`,
				[data.nome, data.cognome, data.email, data.data_nascita, data.image, idCliente],
				function (err: Error | null) {
					if (err) {
						console.error('❌ [ClienteModel ERROR] update:', err.message);
						return reject(err);
					}
					resolve();
				}
			);
		});
	}

	/**
	 * Restituisce i punti associati a un cliente.
	 *
	 * @param idCliente - Numero carta cliente
	 * @returns Numero di punti o 0 se il cliente non esiste
	 */
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
					return resolve(0);
				}
				resolve(row.punti);
			});
		});
	}

	/**
	 * Imposta un nuovo valore per i punti del cliente.
	 *
	 * @param idCliente - Numero carta del cliente
	 * @param nuoviPunti - Nuovo valore dei punti
	 */
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

	/**
	 * Recupera tutti i clienti dal database.
	 *
	 * @returns Lista di record cliente
	 */
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

	/**
	 * Recupera un cliente tramite numero carta.
	 *
	 * @param numero_carta - Identificativo della carta cliente
	 * @returns Record cliente oppure `null` se non trovato
	 */
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

	// ----------------------------------- ZONA CREDENZIALI ---------------------------------------------------------------

	/**
	 * Crea un nuovo cliente nel database.
	 *
	 * @param data - Dati completi del nuovo cliente
	 * @returns Numero carta del cliente appena creato
	 */
	static async create(data: ClienteData): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO clienti (nome, cognome, data_nascita, email, password, punti, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
				[data.nome, data.cognome, data.data_nascita, data.email, data.password, 0, data.image],
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

	/**
	 * Aggiorna la password del cliente.
	 *
	 * @param idCliente - Numero carta del cliente
	 * @param nuovaPassword - Password aggiornata
	 */
	static async aggiornaPassword(idCliente: number, nuovaPassword: string): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(`
				UPDATE clienti
				SET password = ?
				WHERE numero_carta = ?
			`, [nuovaPassword, idCliente], 
			function (err: Error | null) {
				if (err) {
					console.error('❌ [ClienteModel ERROR] aggiornaPassword:', err.message);
					return reject(err);
				}
				resolve();
			});
		});
	}

	/**
	 * Aggiorna l'email del cliente.
	 *
	 * @param idCliente - Numero carta del cliente
	 * @param newEmail - Nuovo indirizzo email
	 */
	static async aggiornaEmail(idCliente: number, newEmail: string): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(`
				UPDATE clienti
				SET email = ?
				WHERE numero_carta = ?
			`, [newEmail, idCliente], 
			function (err: Error | null) {
				if (err) {
					console.error('❌ [ClienteModel ERROR] aggiornaEmail:', err.message);
					return reject(err);
				}
				resolve();
			});
		});
	}

	/**
	 * Recupera un cliente tramite email.
	 *
	 * @param email - Email del cliente
	 * @returns Record del cliente oppure `null` se non esiste
	 */
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

	/**
	 * Aggiorna il token associato al cliente.
	 *
	 * @param numeroCarta - Numero carta del cliente
	 * @param token - Nuovo token da salvare
	 * @returns Token appena aggiornato
	 */
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

	/**
	 * Recupera un cliente a partire dal token salvato.
	 *
	 * @param token - Token autenticazione
	 * @returns Record cliente o `null` se non trovato
	 */
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

	/**
	 * Invalida il token del cliente (logout).
	 *
	 * @param numero_carta - Numero carta del cliente
	 */
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

	/**
	 * Confronta una password inserita con l'hash salvato.
	 *
	 * @param candidatePassword - Password in chiaro
	 * @param hash - Hash salvato nel DB
	 * @returns `true` se combacia, `false` altrimenti
	 */
	static async comparePassword(candidatePassword: string, hash: string): Promise<boolean> {
		return bcrypt.compare(candidatePassword, hash);
	}

	/**
	 * Effettua login controllando le credenziali.
	 *
	 * @param email - Email utente
	 * @param password - Password in chiaro
	 * @returns `true` se autenticato correttamente, `false` altrimenti
	 */
	static async login(email: string, password: string): Promise<boolean> {
		const user = await this.getByEmail(email);
		if (!user) return false;
		return this.comparePassword(password, user.password);
	}
}

export default Cliente;