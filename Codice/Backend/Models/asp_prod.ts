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

export class AspProd {
	// Creazione di un nuovo asporto prodotto
	static async create(data: AspProdInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO asp_prod (ref_asporto, ref_prodotto) VALUES (?, ?)',
				[data.ref_asporto, data.ref_prodotto],
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
}

export default AspProd;
