// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello della filiale
export interface FilialeInput {
	comune: string;
	indirizzo: string;
	num_tavoli: number;
	longitudine: string;
	latitudine: string;
	immagine: string;
}

export interface FilialeRecord extends FilialeInput {
	id_filiale: number;
}

export class Filiale {
	// Creazione di una nuova filiale
	static async create(data: FilialeInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO filiali (comune, indirizzo, num_tavoli, longitudine, latitudine, immagine) VALUES (?, ?, ?, ?, ?, ?)',
				[data.comune, data.indirizzo, data.num_tavoli, data.longitudine, data.latitudine, data.immagine],
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

	// Modifica Filiale
	static async updateFiliale(data: FilialeInput, id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE filiali SET comune = ?, indirizzo = ?, num_tavoli = ?, longitudine = ?, latitudine = ?, immagine = ? WHERE id_filiale = ?',
				[data.comune, data.indirizzo, data.num_tavoli, data.longitudine, data.latitudine, data.immagine,
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
					}
					else resolve();
				}
			);
		});
	}

	// Selezione di tutte le Filiali
	static async getAll(): Promise<FilialeRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM filiali',
				(err: Error | null, rows: FilialeRecord[]) => {
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

	// Seleziona per id
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

export default Filiale;
