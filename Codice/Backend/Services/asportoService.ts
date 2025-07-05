import AspProd, { AspProdInput } from "../Models/asp_prod";
import Asporto, { AsportoInput } from "../Models/asporto";
import Pagamento, { PagamentoInput } from "../Models/pagamento";

/**
 * Interfaccia dei dati necessari per creare un ordine d'asporto completo.
 */
export interface AsportoData {
	/** Indirizzo di consegna dell'asporto */
	indirizzo: string;
	/** Data e ora desiderate per la consegna (formato: yyyy-MM-dd HH:mm) */
	data_ora_consegna: string;
	/** ID del cliente che ha effettuato l'ordine */
	ref_cliente: number;
	/** ID della filiale da cui parte l'ordine */
	ref_filiale: number;
	/** Importo totale da pagare */
	importo: number;
	/** Data e ora del pagamento (formato: yyyy-MM-dd HH:mm) */
	data_ora_pagamento: string;
	/** Lista degli ID dei prodotti inclusi nell'asporto */
	prodotti: number[];
}

/**
 * Servizio per la gestione degli ordini d'asporto.
 * Si occupa di creare il pagamento, l'asporto e l'associazione ai prodotti.
 */
class AsportoService {
	/**
	 * Crea un nuovo ordine d'asporto completo.
	 * 1. Registra il pagamento
	 * 2. Registra l'ordine d'asporto
	 * 3. Associa i prodotti all'asporto
	 *
	 * @param data - Dati completi dell'asporto da creare
	 * @returns L'ID dell'asporto creato
	 * @throws Se fallisce uno dei passaggi (pagamento, asporto o prodotti)
	 */
	static async addAsporto(data: AsportoData): Promise<number> {
		// 1. Crea il pagamento associato
		const pagamentoData = { importo: data.importo, data_ora_pagamento: data.data_ora_pagamento } as PagamentoInput;
		const id_pagamento = await Pagamento.create(pagamentoData);
		if(!id_pagamento) {
			// Se fallisce la creazione del pagamento, interrompe il processo
			throw new Error("Creazione del pagamento fallita.");
		}

		// 2. Crea il record dell'asporto, collegato al pagamento
		const asportoData = {indirizzo: data.indirizzo, data_ora_consegna: data.data_ora_consegna, ref_cliente: data.ref_cliente, ref_pagamento: id_pagamento, ref_filiale: data.ref_filiale} as AsportoInput;
		const id_asporto = await Asporto.create(asportoData);
		if(!id_asporto) {
			// Se fallisce la creazione dell'asporto, interrompe il processo
			throw new Error("Creazione dell'asporto fallia.")
		}

		// 3. Per ogni prodotto selezionato, crea l'associazione con l'asporto
		for(const p of data.prodotti) {
			const asp_prod = {ref_asporto: id_asporto, ref_prodotto: p} as AspProdInput;
			const id_AspProd = await AspProd.create(asp_prod);
			if(!id_AspProd) {
				// Se fallisce l'associazione di un prodotto, solleva errore specifico
				throw new Error(`Aggiunta del prodotto ${p} fallita.`)
			}
		}

		// Restituisce l'ID dell'asporto creato con successo
		return id_asporto;
	}
}

export default AsportoService;