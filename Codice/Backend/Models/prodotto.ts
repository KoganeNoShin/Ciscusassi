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
	is_piatto_giorno: boolean;
}
export interface ProdottoRecord extends ProdottoInput {
	id_prodotto: number;
}

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
export class Prodotto {
	// definisco il metodo per creare un nuovo utente
	static async create(data: ProdottoInput): Promise<number> {
		const {
			nome,
			descrizione,
			costo,
			immagine,
			categoria,
			is_piatto_giorno,
		} = data;

		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO prodotti (nome, descrizione, costo, immagine, categoria, is_piatto_giorno) VALUES (?, ?, ?, ?, ?, ?)',
				[
					nome,
					descrizione,
					costo,
					immagine,
					categoria,
					is_piatto_giorno,
				],
				function (this: RunResult, err: Error | null) {
					if (err) reject(err);
					else resolve(this.lastID);
				}
			);
		});
	}

	// definiamo il metodo per ritornare tutti i prodotti
	static async findAll(): Promise<ProdottoRecord[]> {
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
					}else {
						console.log('✅ [DB SUCCESS] SELECT prodotti eseguita con successo');
						resolve(rows);
					}
				}
			);
		});
	}

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
					} else {
						console.log('✅ [DB SUCCESS] SELECT Piatto del giorno eseguita con successo');
						resolve(row);
					}
				}
			);
		});
	}

	// ricerca per id
	static async findById(id: number): Promise<ProdottoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM prodotti WHERE id_prodotto = ?',
				[id],
				(err: Error | null, row: ProdottoRecord) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.log('⚠️ [DB WARNING] Nessun piatto trovato con ID:', id);
						resolve(null);
					} else {
						console.log('✅ [DB SUCCESS] SELECT Piatto trovato eseguita con successo');
						resolve(row);
					}
				}
			);
		});
	}

	// Aggiunta Piatto
	static async addProdotto(id: ProdottoInput): Promise<number> {
		console.log('Aggiunta Prodotto:', id.nome);

		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO prodotti (nome, descrizione, costo, immagine, categoria, is_piatto_giorno) VALUES (?, ?, ?, ?, ?, ?)',
				[
					id.nome,
					id.descrizione,
					id.costo,
					id.immagine,
					id.categoria,
					id.is_piatto_giorno,
				],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante INSERT:', err.message);
						console.error('🧾 Query params:', id);
						reject(err);
					}
					else {
						console.log('✅ [DB SUCCESS] Nuovo prodotto inserito con ID:', this.lastID);
						resolve(this.lastID);
					}
				}
			);
		})
	}

	// Modifica Piatto
	static async updateProdotto(data: ProdottoInput, id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE prodotti SET nome = ?, descrizione = ?, costo = ?, immagine = ?, categoria = ?, is_piatto_giorno = ? WHERE id_prodotto = ?',
				[
					data.nome,
					data.descrizione,
					data.costo,
					data.immagine,
					data.categoria,
					data.is_piatto_giorno,
					id,
				],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante UPDATE:', err.message);
						console.error('🧾 Query params:', id);
						reject(err);
					}
					else {
						console.log('✅ [DB SUCCESS] Aggiornamento prodotto inserito con ID:', this.lastID);
						resolve();
					}
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
					else {
						console.log('✅ [DB SUCCESS] Eliminazione prodotto inserito con ID:', id);
						resolve();
					}
				}
			);
		});
	}

	static async chargePiattoDelGiorno(id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE prodotti SET is_piatto_giorno = 0 WHERE is_piatto_giorno = 1',
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante UPDATE piatto del giorno:', err.message);
						console.error('🧾 Query params:', id);
						reject(err);
					}
					
					console.log('✅ [DB SUCCESS] Aggiornamento rimozione piatto del giorno');
					
					db.run(
						'UPDATE prodotti SET is_piatto_giorno = 1 WHERE id_prodotto = ?',
						[id],
						function (this: RunResult, err: Error | null) {
							if (err) {
								console.error('❌ [DB ERROR] Errore durante UPDATE piatto del giorno:', err.message);
								console.error('🧾 Query params:', id);
								reject(err);
							}
							else {
								console.log('✅ [DB SUCCESS] Aggiornamento piatto del giorno con ID:', id);
								resolve();
							}
						}
					);
				}
			);
		});
	}
}

export default Prodotto;
