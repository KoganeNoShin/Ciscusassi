// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello di una As_Prod
export interface AspProdInput {
	ref_asporto: number;
	ref_prodotto: number;
}
export interface AspProdRecord extends AspProdInput {
	id_asp_prod: number;
}

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
export class AspProd {
	// definisco il metodo per creare un nuovo utente
	static async create(data: AspProdInput): Promise<number> {
		const { ref_asporto, ref_prodotto } = data;

		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO asp_prod (ref_asporto, ref_prodotto) VALUES (?, ?)',
				[ref_asporto, ref_prodotto],
				function (this: RunResult, err: Error | null) {
					if (err) reject(err);
					else resolve(this.lastID);
				}
			);
		});
	}

	// ricerca per id
	static async findById(id: number): Promise<AspProdRecord> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM asp_prod WHERE id_asp_prod = ?',
				[id],
				(err: Error | null, row: AspProdRecord) => {
					if (err) reject(err);
					else resolve(row);
				}
			);
		});
	}
}

export default AspProd;
