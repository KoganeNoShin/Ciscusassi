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

	// Aggiunta Ordine
	static async addOrdine(id: OrdineInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO ordini username_ordinante, data_ora_ordinazione, ref_prenotazione, ref_cliente, ref_pagamento) VALUES (?, ?, ?, ?, ?)',
				[
					id.username_ordinante,
					id.data_ora_ordinazione,
					id.ref_prenotazione,
					id.ref_cliente,
					id.ref_pagamento,
				],
				function (this: RunResult, err: Error | null) {
					if (err) reject(err);
					else resolve(this.lastID);
				}
			);
		})
	}

	// Modifica Ordine
	static async updateOrdine(data: OrdineInput, id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'UPDATE ordini SET username_ordinante = ?, data_ora_ordinazione = ?, ref_prenotazione = ?, ref_cliente = ?, ref_pagamento = ? WHERE id_ordine = ?',
				[
					data.username_ordinante,
					data.data_ora_ordinazione,
					data.ref_prenotazione,
					data.ref_cliente,
					data.ref_pagamento,
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
	static async deleteOrdine(id: number): Promise<void> {
		return new Promise((resolve, reject) => {
			db.run(
				'DELETE FROM ordini WHERE id_ordine = ?',
				[id],
				function (this: RunResult, err: Error | null) {
					if (err) reject(err);
					else resolve();
				}
			);
		});
	}
}

export default Ordine;
