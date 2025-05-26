// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello di un Prodotto
export interface ProdottoInput {
	nome: string;
	descrizione: string;
	costo: number;
	immagine: string;
	categoria: string;
}

export interface ProdottoRecord extends ProdottoInput {
	id_prodotto: number;
}

export class Prodotto {
	// Creazione di un nuovo Prodotto
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
					else resolve(this.lastID);
				}
			);
		});
	}

	// Modifica Piatto
	static async updateProdotto(data: ProdottoInput, id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE prodotti SET nome = ?, descrizione = ?, costo = ?, immagine = ?, categoria = ? WHERE id_prodotto = ?',
				[data.nome, data.descrizione, data.costo, data.immagine, data.categoria, 
				id],
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

	// Elimina Piatto
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
	
	// Disattiva Piatto del Giorno
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

	// Attiva Piatto del Giorno
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

	// Selezione di tutti i Prodotti
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

	// Selezione del Piatto del Giorno
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

	// Selezione per ID
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
