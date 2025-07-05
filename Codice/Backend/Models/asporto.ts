// Importa l'istanza del database SQLite
import db from '../db';

// Importa il tipo RunResult per ottenere dettagli sull'inserimento (es. lastID)
import { RunResult } from 'sqlite3';

/**
 * Interfaccia che rappresenta i dati necessari per creare un nuovo record di asporto.
 */
export interface AsportoInput {
	/** Indirizzo di consegna dell'asporto */
	indirizzo: string;

	/** Data e ora previste per la consegna */
	data_ora_consegna: string;

	/** ID del cliente che ha effettuato l'asporto (foreign key) */
	ref_cliente: number;

	/** ID del metodo di pagamento associato (foreign key) */
	ref_pagamento: number;

	/** ID della filiale da cui parte l'asporto (foreign key) */
	ref_filiale: number;
}

/**
 * Estensione dell'input `AsportoInput` che include l'identificativo del record.
 */
export interface AsportoRecord extends AsportoInput {
	/** Identificativo univoco dell'asporto (primary key) */
	id_asporto: number;
}

/**
 * Classe che gestisce le operazioni sulla tabella `asporti`,
 * contenente gli ordini d'asporto effettuati dai clienti.
 */
export class Asporto {
	/**
	 * Inserisce un nuovo record nella tabella `asporti`.
	 *
	 * @param data - Oggetto contenente i dati dell'asporto
	 * @returns Una Promise che risolve con l'ID del nuovo asporto inserito
	 */
	static async create(data: AsportoInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO asporti (indirizzo, data_ora_consegna, ref_cliente, ref_pagamento, ref_filiale) VALUES (?, ?, ?, ?, ?)',
				[data.indirizzo, data.data_ora_consegna, data.ref_cliente, data.ref_pagamento, data.ref_filiale],
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
	 * Recupera un asporto dal database tramite il suo ID.
	 *
	 * @param id - Identificativo dell'asporto da recuperare
	 * @returns Una Promise che risolve con il record dell'asporto o `null` se non trovato
	 */
	static async getByID(id: number): Promise<AsportoRecord | null> {
		return new Promise((resolve, reject) => {
			db.get(
				'SELECT * FROM asporti WHERE id_asporto = ?',
				[id],
				(err: Error | null, row: AsportoRecord | null) => {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante SELECT:', err.message);
						reject(err);
					} else if (!row) {
						console.log('⚠️ [DB WARNING] Nessun Asporto trovato');
						resolve(null);
					} else resolve(row);
				}
			);
		});
	}
}

// Esporta la classe `Asporto` per essere utilizzata in altri moduli
export default Asporto;