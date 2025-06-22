// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello di una Torretta
export interface TorrettaInput {
	ref_filiale: number;
}
export interface TorrettaRecord extends TorrettaInput {
	id_torretta: number;
}

export class Torretta {
	// Creazione di una nuova Torretta
	static async create(data: TorrettaInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO torrette (ref_filiale) VALUES (?)',
				[data.ref_filiale],
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

	// Recupera tutte le torrette
	static async getAll(): Promise<TorrettaRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM torrette',
				(err: Error | null, rows: TorrettaRecord[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessuna torretta trovata');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}

	// Recupera torretta per ID
	static async getById(id: number): Promise<TorrettaRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM torrette WHERE id_torretta = ?',
				[id],
				(err: Error | null, row: TorrettaRecord) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.warn(`⚠️ [DB WARNING] Nessuna torretta trovata con ID ${id}`);
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}

	// Recupera torrette libere
	static async getTorretteLibere(filialeId: number, dataOra: string): Promise<TorrettaRecord[]> {
	return new Promise((resolve, reject) => {
		db.all(`
			SELECT t.*
			FROM torrette t
			WHERE t.ref_filiale = ?
			  AND t.id_torretta NOT IN (
				SELECT p.ref_torretta
				FROM prenotazioni p
				WHERE p.data_ora_prenotazione = ?
			  )`,
			[filialeId, dataOra],
			(err: Error | null, rows: TorrettaRecord[]) => {
				if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!rows || rows.length === 0) {
						console.warn('⚠️ [DB WARNING] Nessuna torretta libera trovata');
						resolve([]);
					} else resolve(rows);
				}
			);
		});
	}
}

export default Torretta;
