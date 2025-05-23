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

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
export class Filiale {
	// definisco il metodo per creare un nuovo utente
	static async create(data: FilialeInput): Promise<number> {
		const {
			comune,
			indirizzo,
			num_tavoli,
			longitudine,
			latitudine,
			immagine,
		} = data;

		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO filiali (comune, indirizzo, num_tavoli, longitudine, latitudine, immagine) VALUES (?, ?, ?, ?, ?, ?)',
				[
					comune,
					indirizzo,
					num_tavoli,
					longitudine,
					latitudine,
					immagine,
				],
				function (this: RunResult, err: Error | null) {
					if (err) reject(err);
					else resolve(this.lastID);
				}
			);
		});
	}

	static async findAll(): Promise<FilialeRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM filiali',
				(err: Error | null, rows: FilialeRecord[]) => {
					if (err) reject(err);
					else resolve(rows);
				}
			);
		});
	}

	// ricerca per id
	static async findById(id: number): Promise<FilialeRecord> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM filiali WHERE id_filiale = ?',
				[id],
				(err: Error | null, row: FilialeRecord) => {
					if (err) reject(err);
					else resolve(row);
				}
			);
		});
	}

	// Aggiunta Filiale
	static async addFiliale(id: FilialeInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO filiali (comune, indirizzo, num_tavoli, longitudine, latitudine, immagine) VALUES (?, ?, ?, ?, ?, ?)',
				[
					id.comune,
					id.indirizzo,
					id.num_tavoli,
					id.longitudine,
					id.latitudine,
					id.immagine,
				],
				function (this: RunResult, err: Error | null) {
					if (err) reject(err);
					else resolve(this.lastID);
				}
			);
		})
	}

	// Modifica Filiale
	static async updateFiliale(data: FilialeInput, id: number): Promise<void> {
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
					id,
				],
				function (this: RunResult, err: Error | null) {
					if (err) reject(err);
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
					if (err) reject(err);
					else resolve();
				}
			);
		});
	}
}

export default Filiale;
