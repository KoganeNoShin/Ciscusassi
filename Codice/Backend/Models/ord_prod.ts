// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello di un Prodotto Ordinato
export interface OrdProdInput {
	is_romana: boolean;
	stato: string;
	ref_prodotto: number;
	ref_ordine: number;
}

export interface OrdProdRecord extends OrdProdInput {
	id_ord_prod: number;
}

export class OrdProd {
	// Creazione di un nuovo OrdProd
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

	// Rimuovi un prodotto ordinato
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

	// Selezione di un Prodotto Ordinato per ID
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

	// Selezione di tutti i Prodotti Ordinati per Ordine
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
						console.warn('⚠️ [DB WARNING] Nessun prodotto nell\'ordine trovato');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	// Selezione dei Prodotti Ordinati per Ordine e se Romana
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

	// Selezione dei Prodotti Ordinati per Ordine
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

	// Cambia Stato
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
}


export default OrdProd;
