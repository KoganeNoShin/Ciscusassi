// Importa l'istanza del database SQLite
import db from '../db';

// Importa il tipo RunResult per accedere a proprietà come `lastID`
import { RunResult } from 'sqlite3';

/**
 * Interfaccia per l'input necessario alla creazione di un record asp_prod.
 * Associa un prodotto a una specifica prenotazione d'asporto.
 */
export interface AspProdInput {
	/** Riferimento alla prenotazione d'asporto (foreign key) */
	ref_asporto: number;

	/** Riferimento al prodotto associato (foreign key) */
	ref_prodotto: number;
}

/**
 * Estensione dell'input AspProdInput che include l'identificativo univoco del record.
 */
export interface AspProdRecord extends AspProdInput {
	/** Identificativo univoco del record asp_prod (primary key) */
	id_asp_prod: number;
}

/**
 * Classe per la gestione dei record nella tabella `asp_prod`,
 * che rappresentano l'associazione tra un asporto e i prodotti ordinati.
 */
export class AspProd {
	/**
	 * Crea un nuovo record nella tabella `asp_prod`.
	 *
	 * @param data - Oggetto contenente `ref_asporto` e `ref_prodotto`
	 * @returns Una Promise che risolve con l'ID del nuovo record inserito
	 */
	static async create(data: AspProdInput): Promise<number> {
		return new Promise((resolve, reject) => {
			db.run(
				'INSERT INTO asp_prod (ref_asporto, ref_prodotto) VALUES (?, ?)',
				[data.ref_asporto, data.ref_prodotto],
				function (this: RunResult, err: Error | null) {
					if (err) {
						console.error('❌ [DB ERROR] Errore durante INSERT:', err.message);
						reject(err);
					} else {
						resolve(this.lastID);
					}
				}
			);
		});
	}
}

// Esporta la classe come modulo di default
export default AspProd;