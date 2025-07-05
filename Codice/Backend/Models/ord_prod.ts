// Importa il database SQLite
import db from '../db';
import { RunResult } from 'sqlite3';

/**
 * Dati necessari per inserire un prodotto ordinato.
 */
export interface OrdProdInput {
	/** Indica se il prodotto è in versione "romana" */
	is_romana: boolean;
	/** Stato attuale del prodotto (es. "in preparazione", "consegnato") */
	stato: string;
	/** ID del prodotto ordinato */
	ref_prodotto: number;
	/** ID dell'ordine a cui è associato il prodotto */
	ref_ordine: number;
}

/**
 * Record completo del prodotto ordinato, incluso l'ID univoco.
 */
export interface OrdProdRecord extends OrdProdInput {
	/** ID univoco del prodotto ordinato */
	id_ord_prod: number;
}

/**
 * Classe `OrdProd` per la gestione dei prodotti associati a un ordine.
 */
export class OrdProd {
	/**
	 * Crea un nuovo prodotto ordinato.
	 * 
	 * @param data - Dati del prodotto da inserire
	 * @returns ID del nuovo record inserito
	 */
	static async create(data: OrdProdInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO ord_prod (is_romana, stato, ref_prodotto, ref_ordine) VALUES (?, ?, ?, ?)',
				[data.is_romana, data.stato, data.ref_prodotto, data.ref_ordine],
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
	 * Rimuove un prodotto ordinato tramite ID.
	 * 
	 * @param id_ord_prod - ID del prodotto ordinato
	 */
	static async removeProdotto(id_ord_prod: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'DELETE FROM ord_prod WHERE id_ord_prod = ?',
				[id_ord_prod],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante DELETE:', err.message);
						console.error('🧾 Query params:', id_ord_prod);
						reject(err);
					}
					if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessun prodotto dell'ordine eliminato con ID ${id_ord_prod}`);
						return reject(new Error(`Nessun prodotto dell'ordine trovato con ID ${id_ord_prod}`));
					}
					else resolve();
				}
			);
		});
	}

	/**
	 * Recupera un prodotto ordinato tramite il suo ID.
	 * 
	 * @param id_ord_prod - ID del prodotto ordinato
	 * @returns Record del prodotto o null se non trovato
	 */
	static async getById(id_ord_prod: number): Promise<OrdProdRecord | null>{
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM ord_prod WHERE id_ord_prod = ?',
				[id_ord_prod],
				(err: Error | null, row: OrdProdRecord) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.warn(`⚠️ [DB WARNING] Prodotto con ID ${id_ord_prod} non trovato`);
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}

	/**
	 * Restituisce tutti i prodotti ordinati associati a un ordine.
	 * 
	 * @param ref_ordine - ID dell’ordine
	 * @returns Array di prodotti ordinati
	 */
	static async getByOrdine(ref_ordine: number): Promise<OrdProdRecord[] | null> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM ord_prod WHERE ref_ordine = ?',
				[ref_ordine],
				(err: Error | null, rows: OrdProdRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessun prodotto nell\'ordine trovato con id ' + ref_ordine);
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	/**
	 * Restituisce i prodotti ordinati di un ordine filtrati per tipo "romana".
	 * 
	 * @param ref_ordine - ID dell’ordine
	 * @param is_romana - `true` se si vogliono solo prodotti "romani"
	 * @returns Lista dei prodotti corrispondenti
	 */
	static async getByOrdineAndRomana(ref_ordine: number, is_romana: boolean): Promise<OrdProdRecord[] | null> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM ord_prod WHERE ref_ordine = ? AND is_romana = ?',
				[ref_ordine, is_romana],
				(err: Error | null, rows: OrdProdRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessun prodotto nell\'ordine trovato');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	/**
	 * Alias di `getByOrdine` (ridondanza evitabile).
	 * 
	 * @param id_ordine - ID dell’ordine
	 * @returns Lista di prodotti associati all’ordine
	 */
	static async getByOrdineId(id_ordine: number): Promise<OrdProdRecord[] | null> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM ord_prod WHERE ref_ordine = ?',
				[id_ordine],
				(err: Error | null, rows: OrdProdRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessun prodotto nell\'ordine trovato');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	/**
	 * Aggiorna lo stato di un prodotto ordinato.
	 * 
	 * @param id_ord_prod - ID del prodotto
	 * @param nuovoStato - Nuovo stato da impostare
	 */
	static async cambiaStato(id_ord_prod: number, nuovoStato: string): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE ord_prod SET stato = ? WHERE id_ord_prod = ?',
				[nuovoStato, id_ord_prod],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante UPDATE:', err.message);
						reject(err);
					} else if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessun prodotto aggiornato con ID ${id_ord_prod}`);
						return reject(new Error(`Nessun prodotto trovato con ID ${id_ord_prod}`));
					} else resolve();
				}
			);
		});
	}

	/**
	 * Aggiorna il flag `is_romana` di un prodotto ordinato.
	 * 
	 * @param idOrdProd - ID del prodotto ordinato
	 * @param isRomana - Nuovo valore per `is_romana`
	 */
	static async aggiornaStatoRomana(idOrdProd: number, isRomana: boolean): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE ord_prod SET is_romana = ? WHERE id_ord_prod = ?',
				[isRomana, idOrdProd],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante l\'aggiornamento dello stato di romane:', err.message);
						reject(err);
					} else if (this.changes === 0) {
						console.warn(`⚠️ [DB WARNING] Nessuna riga aggiornata per id_ord_prod: ${idOrdProd}`);
						reject(new Error('Nessuna riga aggiornata'));
					} else {
						resolve();
					}
				}
			);
		});
	}
}

export default OrdProd;