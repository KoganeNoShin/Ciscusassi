// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello di un Ordine
export interface OrdineInput {
	username_ordinante: string;
	data_ora_ordinazione: string;
	ref_prenotazione: number;
	ref_cliente: number | null;
	ref_pagamento: number | null;
}
export interface OrdineRecord extends OrdineInput {
	id_ordine: number;
}

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
export class Ordine {
	// definisco il metodo per creare un nuovo utente
	static async create(data: OrdineInput): Promise<number> {
		const {
			username_ordinante,
			data_ora_ordinazione,
			ref_prenotazione,
			ref_cliente,
			ref_pagamento,
		} = data;

		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO ordini (username_ordinante, data_ora_ordinazione, ref_prenotazione, ref_cliente, ref_pagamento) VALUES (?, ?, ?, ?, ?)',
				[
					username_ordinante,
					data_ora_ordinazione,
					ref_prenotazione,
					ref_cliente,
					ref_pagamento,
				],
				function (err) {
					if (err) reject(err);
					else resolve(this.lastID);
				}
			);
		});
	}

	// definiamo il metodo per ritornare tutti gli ordini
	static async findAll(): Promise<OrdineRecord[]> {
		return new Promise((resolve, reject) => {
			db.all(
				'SELECT * FROM ordini',
				(err: Error | null, rows: OrdineRecord[]) => {
					if (err) reject(err);
					else resolve(rows);
				}
			);
		});
	}

	// ricerca per id
	static async findById(id: number): Promise<OrdineRecord> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM pagamenti WHERE id_pagamento = ?',
				[id],
				(err: Error | null, row: OrdineRecord) => {
					if (err) reject(err);
					else resolve(row);
				}
			);
		});
	}

	// Aggiorna pagamento
	/*static async updatePagamento(id: number, idPagamento: number): Promise<RunResult>{
        return new Promise((resolve, reject) => {
            db.run('UPDATE pagamenti SET importo = ? WHERE id_pagamento = ?', [id, idPagamento], (err: Error | null, row: RunResult) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }*/
}

export default Ordine;
