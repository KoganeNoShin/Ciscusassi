// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

/**
 * Interfaccia che rappresenta i dati in input per creare una torretta.
 */
export interface TorrettaInput {
	/** ID della filiale a cui è associata la torretta */
	ref_filiale: number;
}

/**
 * Interfaccia che rappresenta un record completo della tabella `torrette`.
 * Estende `TorrettaInput` e aggiunge l'identificativo univoco della torretta.
 */
export interface TorrettaRecord extends TorrettaInput {
	/** Identificativo univoco della torretta nel database */
	id_torretta: number;
}

export class Torretta {
	/**
	 * Crea una nuova torretta nel database.
	 * @param data Oggetto contenente i dati della torretta da inserire.
	 * @returns L'ID della nuova torretta creata.
	 */
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

	/**
	 * Recupera tutte le torrette presenti nel database.
	 * @returns Un array di oggetti `TorrettaRecord`.
	 */
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

	/**
	 * Recupera una torretta specifica tramite il suo ID.
	 * @param id L'identificativo della torretta da cercare.
	 * @returns L'oggetto `TorrettaRecord` oppure `null` se non trovata.
	 */
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

	/**
	 * Recupera le torrette **libere** in una determinata filiale e fascia oraria.
	 * Una torretta è considerata libera se non è associata a una prenotazione per quella data e ora.
	 * @param filialeId L'ID della filiale di interesse.
	 * @param dataOra La data e ora nel formato `yyyy-MM-dd HH:mm`.
	 * @returns Un array di torrette libere come `TorrettaRecord[]`.
	 */
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
