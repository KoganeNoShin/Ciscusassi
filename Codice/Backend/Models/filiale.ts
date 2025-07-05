// Importa il database SQLite
import db from '../db';
import { RunResult } from 'sqlite3';

/**
 * Interfaccia per l'inserimento di una nuova filiale nel database.
 */
export interface FilialeInput {
	/** Comune in cui si trova la filiale */
	comune: string;
	/** Indirizzo dettagliato della filiale */
	indirizzo: string;
	/** Numero totale di tavoli disponibili */
	num_tavoli: number;
	/** Longitudine della posizione geografica della filiale */
	longitudine: string;
	/** Latitudine della posizione geografica della filiale */
	latitudine: string;
	/** URL o path dell'immagine della filiale */
	immagine: string;
}

/**
 * Interfaccia che rappresenta un record completo della filiale nel database.
 */
export interface FilialeRecord extends FilialeInput {
	/** Identificativo univoco della filiale (primary key) */
	id_filiale: number;
}

/**
 * Classe che gestisce tutte le operazioni CRUD sulla tabella `filiali`.
 */
export class Filiale {
	/**
	 * Crea una nuova filiale nel database.
	 * 
	 * @param data - Dati della filiale da inserire
	 * @returns ID della filiale appena creata
	 */
	static async create(data: FilialeInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO filiali (comune, indirizzo, num_tavoli, longitudine, latitudine, immagine) VALUES (?, ?, ?, ?, ?, ?)',
				[
					data.comune,
					data.indirizzo,
					data.num_tavoli,
					data.longitudine,
					data.latitudine,
					data.immagine,
				],
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
	 * Aggiorna i dati di una filiale esistente nel database.
	 * 
	 * @param data - Dati aggiornati della filiale
	 * @param id_filiale - ID della filiale da modificare
	 */
	static async updateFiliale(data: FilialeRecord, id_filiale: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE filiali SET comune = ?, indirizzo = ?, num_tavoli = ?, longitudine = ?, latitudine = ?, immagine = ? WHERE id_filiale = ?',
				[
					data.comune,
					data.indirizzo,
					data.num_tavoli,
					data.longitudine,
					data.latitudine,
					data.immagine,
					id_filiale,
				],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante UPDATE:', err.message);
						console.error('🧾 Query params:', data.id_filiale);
						reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessuna filiale aggiornato con ID ${data.id_filiale}`);
						return reject(new Error(`Nessuna filiale trovata con ID ${data.id_filiale}`));
					} else resolve();
				}
			);
		});
	}

	/**
	 * Elimina una filiale dal database tramite ID.
	 * 
	 * @param id - ID della filiale da eliminare
	 */
	static async deleteFiliale(id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'DELETE FROM filiali WHERE id_filiale = ?',
				[id],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante DELETE:', err.message);
						console.error('🧾 Query params:', id);
						reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessun prodotto eliminato con ID ${id}`);
						return reject(new Error(`Nessun prodotto trovato con ID ${id}`));
					} else resolve();
				}
			);
		});
	}

	/**
	 * Restituisce la lista completa delle filiali registrate nel database.
	 * 
	 * @returns Array di record delle filiali
	 */
	static async getAll(): Promise<FilialeRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM filiali',
				(err: Error | null, rows: FilialeRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessuna filiale trovato');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	/**
	 * Recupera una filiale tramite il suo ID.
	 * 
	 * @param id - Identificativo della filiale
	 * @returns Record della filiale o `null` se non trovata
	 */
	static async getById(id: number): Promise<FilialeRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM filiali WHERE id_filiale = ?',
				[id],
				(err: Error | null, row: FilialeRecord) => {
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
}

// Esporta la classe per usarla nei controller o in altri moduli
export default Filiale;