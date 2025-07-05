// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

/**
 * Interfaccia che rappresenta i dati in input per creare o aggiornare un prodotto.
 */
export interface ProdottoInput {
	/** Nome del prodotto */
	nome: string;
	/** Descrizione del prodotto */
	descrizione: string;
	/** Costo del prodotto in euro */
	costo: number;
	/** URL o path dell'immagine del prodotto */
	immagine: string;
	/** Categoria a cui appartiene il prodotto (es. primi, dolci, bevande...) */
	categoria: string;
}

/**
 * Interfaccia che rappresenta un record completo di prodotto presente nel database.
 * Estende `ProdottoInput` e include anche l'ID e il flag facoltativo `is_piatto_giorno`.
 */
export interface ProdottoRecord extends ProdottoInput {
	/** Identificativo univoco del prodotto nel database */
	id_prodotto: number;
	/** Indica se il prodotto è attualmente il piatto del giorno (1 = sì, 0/null = no) */
	is_piatto_giorno?: boolean;
}


export class Prodotto {
	/**
	 * Crea un nuovo prodotto nel database.
	 * @param data - I dati del prodotto da inserire.
	 * @returns L'ID del prodotto appena creato.
	 */
	static async create(data: ProdottoInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO prodotti (nome, descrizione, costo, immagine, categoria) VALUES (?, ?, ?, ?, ?)',
				[data.nome, data.descrizione, data.costo, data.immagine, data.categoria],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante INSERT:', err.message);
						reject(err);
					}
					else resolve(this.lastID); // restituisce l'ID appena inserito
				}
			);
		});
	}

	/**
	 * Aggiorna un prodotto esistente nel database.
	 * @param data - I nuovi dati del prodotto.
	 * @param id - L'ID del prodotto da aggiornare.
	 * @returns Void se aggiornamento avvenuto con successo, altrimenti errore.
	 */
	static async updateProdotto(data: ProdottoInput, id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE prodotti SET nome = ?, descrizione = ?, costo = ?, immagine = ?, categoria = ? WHERE id_prodotto = ?',
				[data.nome, data.descrizione, data.costo, data.immagine, data.categoria, id],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante UPDATE:', err.message);
						console.error('🧾 Query params:', id);
						reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessun prodotto aggiornato con ID ${id}`);
						return reject(new Error(`Nessun prodotto trovato con ID ${id}`));
					}
					else resolve();
				}
			);
		});
	}

	/**
	 * Elimina un prodotto dal database tramite ID.
	 * @param id - L'ID del prodotto da eliminare.
	 */
	static async deleteProdotto(id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'DELETE FROM prodotti WHERE id_prodotto = ?',
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
					}
					else resolve();
				}
			);
		});
	}
	
	/**
	 * Disattiva il piatto del giorno (imposta tutti i flag a false).
	 */
	static async disattivaPiattoDelGiorno(): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE prodotti SET is_piatto_giorno = 0 WHERE is_piatto_giorno = 1',
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante UPDATE disattivazione piatto del giorno:', err.message);
						reject(err);
					} else resolve();
				}
			);
		});
	}

	/**
	 * Attiva il piatto del giorno per uno specifico prodotto.
	 * @param id - L'ID del prodotto da marcare come piatto del giorno.
	 */
	static async attivaPiattoDelGiorno(id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE prodotti SET is_piatto_giorno = 1 WHERE id_prodotto = ?',
				[id],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante UPDATE attivazione piatto del giorno:', err.message);
						console.error('🧾 Query params:', id);
						reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessun prodotto aggiornato con ID ${id}`);
						return reject(new Error(`Nessun prodotto trovato con ID ${id}`));
					} else resolve();
				}
			);
		});
	}

	/**
	 * Restituisce l'elenco di tutti i prodotti ordinati per categoria decrescente.
	 * @returns Lista di tutti i prodotti presenti nel database.
	 */
	static async getAll(): Promise<ProdottoRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM prodotti p ORDER BY p.categoria DESC',
				(err: Error | null, rows: ProdottoRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessun piatto trovato');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	/**
	 * Restituisce il prodotto che è stato marcato come piatto del giorno.
	 * @returns Il prodotto marcato come piatto del giorno oppure null se non presente.
	 */
	static async getPiattoDelGiorno(): Promise<ProdottoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM prodotti WHERE is_piatto_giorno = 1',
				(err: Error | null, row: ProdottoRecord) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.log('⚠️ [DB WARNING] Nessun piatto trovato del giorno');
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}

	/**
	 * Restituisce un prodotto dato il suo ID.
	 * @param id - L'ID del prodotto da recuperare.
	 * @returns Il prodotto corrispondente oppure null se non trovato.
	 */
	static async getByID(id: number): Promise<ProdottoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM prodotti WHERE id_prodotto = ?',
				[id],
				(err: Error | null, row: ProdottoRecord | null) => {
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

export default Prodotto;