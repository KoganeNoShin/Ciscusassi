// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';
import { AsportoRecord } from './asporto';

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

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
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

	// Ricerca per Ref_Ordine
	static async findByRefOrdine(ref_ordine: number): Promise<OrdProdRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM ord_prod WHERE ref_ordine = ?',
				[ref_ordine],
				(err: Error | null, rows: OrdProdRecord[]) => {
					if (err) reject(err);
					else resolve(rows);
				}
			);
		});
	}
}

export default OrdProd;
