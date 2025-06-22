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
	// definisco il metodo per creare un nuovo utente
	static async create(data: OrdProdInput): Promise<number> {
		const { is_romana, stato, ref_prodotto, ref_ordine } = data;

		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO ord_prod (is_romana, stato, ref_prodotto, ref_ordine) VALUES (?, ?, ?, ?)',
				[is_romana, stato, ref_prodotto, ref_ordine],
				function (this: RunResult, err: Error | null) {
					if (err) reject(err);
					else resolve(this.lastID);
				}
			);
		});
	}

	static async findAll(): Promise<OrdProdRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM ord_prod',
				(err: Error | null, rows: OrdProdRecord[]) => {
					if (err) reject(err);
					else resolve(rows);
				}
			);
		});
	}

	// Ricerca per id
	static async findById(id: number): Promise<OrdProdRecord> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM ord_prod WHERE id_ord_prod = ?',
				[id],
				(err: Error | null, row: OrdProdRecord) => {
					if (err) reject(err);
					else resolve(row);
				}
			);
		});
	}

	// Aggiungi un prodotto ordinato
	static async addProdotto(ref_ordine: number, ref_prodotto: number): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO ord_prod (ref_ordine, ref_prodotto) VALUES (?, ?)',
				[ref_ordine, ref_prodotto],
				function (this: RunResult, err: Error | null) {
					if (err) reject(err);
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
					if (err) reject(err);
					else resolve();
				}
			);
		});
	}
	// IsRomana cambio
	static async cambiaRomana(id_ord_prod: number): Promise<void> {
	return new Promise((resolve, reject) => {
		db.get(
			'SELECT is_romana FROM ord_prod WHERE id_ord_prod = ?',
			[id_ord_prod],
			(err: Error | null, row: { is_romana: number }) => {
				if (err) return reject(err);
				if (!row) return reject(new Error("Ordine non trovato"));

				const nuovoValore = !row.is_romana;

				db.run(
					'UPDATE ord_prod SET is_romana = ? WHERE id_ord_prod = ?',
					[nuovoValore, id_ord_prod],
					function (this: RunResult, err: Error | null) {
						if (err) reject(err);
						else resolve();
					}
				);
			}
		);
		});
	}

// ----------------------------------CORRETTO----------------------------------
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
