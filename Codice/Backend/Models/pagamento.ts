// Importa il database SQLite
import db from '../db';
import { RunResult } from 'sqlite3';

/**
 * Input richiesto per la creazione di un pagamento.
 */
export interface PagamentoInput {
	/** Importo pagato */
	importo: number;
	/** Timestamp del pagamento nel formato 'YYYY-MM-DD HH:mm' */
	data_ora_pagamento: string;
}

/**
 * Record completo di un pagamento salvato nel database.
 */
export interface PagamentoRecord extends PagamentoInput {
	/** Identificativo univoco del pagamento */
	id_pagamento: number;
}

/**
 * Rappresenta un pagamento aggregato mensile, legato a una filiale.
 */
export interface PagamentoMensile {
	/** Data e ora del pagamento */
	data: string;
	/** Importo pagato */
	importo: number;
	/** ID della filiale associata */
	filiale: number;
}

/**
 * Classe `Pagamento` per la gestione delle operazioni CRUD e analitiche sui pagamenti.
 */
export class Pagamento {
	/**
	 * Crea un nuovo pagamento nel database.
	 *
	 * @param data - Oggetto contenente importo e data/ora del pagamento
	 * @returns ID del pagamento creato
	 */
	static async create(data: PagamentoInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO pagamenti (importo, data_ora_pagamento) VALUES (?, ?)',
				[data.importo, data.data_ora_pagamento],
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
	 * Recupera un pagamento tramite il suo ID.
	 *
	 * @param id - ID del pagamento da cercare
	 * @returns Record del pagamento oppure `null` se non trovato
	 */
	static async getByID(id: number): Promise<PagamentoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM pagamenti WHERE id_pagamento = ?',
				[id],
				(err: Error | null, row: PagamentoRecord | null) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.log('⚠️ [DB WARNING] Nessun Pagamento trovato');
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}

	/**
	 * Restituisce i pagamenti relativi agli **ordini** effettuati in un dato anno, con riferimento alla filiale.
	 *
	 * @param year - Anno da filtrare (es. 2024)
	 * @returns Lista dei pagamenti mensili con data e filiale
	 */
	static async getPagamentiOrdiniByYear(year: number): Promise<PagamentoMensile[]> {
		return new Promise((resolve, reject) => {
			const start = `${year}-01-01 00:00:00`;
			const end = `${year}-12-31 23:59:59`;

			db.all(
				`SELECT p.importo AS importo, p.data_ora_pagamento as data, t.ref_filiale AS filiale 
				FROM pagamenti p 
				INNER JOIN ordini o ON p.id_pagamento = o.ref_pagamento 
				INNER JOIN prenotazioni pr ON o.ref_prenotazione = pr.id_prenotazione 
				INNER JOIN torrette t ON pr.ref_torretta = t.id_torretta 
				WHERE p.data_ora_pagamento BETWEEN ? AND ?`,
				[start, end],
				(err: Error | null, rows: PagamentoMensile[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						return reject(err);
					}
					if (!rows || rows.length === 0) {
						console.warn(`⚠️ [DB WARNING] Nessun pagamento ordine trovato per l'anno ${year}`);
						return resolve([]);
					}
					resolve(rows);
				}
			);
		});
	}

	/**
	 * Restituisce i pagamenti relativi agli **asporti** effettuati in un dato anno, con riferimento alla filiale.
	 *
	 * @param year - Anno da filtrare (es. 2024)
	 * @returns Lista dei pagamenti mensili con data e filiale
	 */
	static async getPagamentiAsportiByYear(year: number): Promise<PagamentoMensile[]> {
		return new Promise((resolve, reject) => {
			const start = `${year}-01-01 00:00`;
			const end = `${year}-12-31 23:59`;

			db.all(
				`SELECT p.importo AS importo, p.data_ora_pagamento as data, a.ref_filiale AS filiale 
				FROM pagamenti p 
				INNER JOIN asporti as a ON p.id_pagamento = a.ref_pagamento 
				WHERE p.data_ora_pagamento BETWEEN ? AND ?`,
				[start, end],
				(err: Error | null, rows: PagamentoMensile[]) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						return reject(err);
					}
					if (!rows || rows.length === 0) {
						console.warn(`⚠️ [DB WARNING] Nessun pagamento asporto trovato per l'anno ${year}`);
						return resolve([]);
					}
					resolve(rows);
				}
			);
		});
	}
}

export default Pagamento;