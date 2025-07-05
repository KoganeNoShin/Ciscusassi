import OrdProd, { OrdProdInput, OrdProdRecord } from "../Models/ord_prod";
import Ordine from "../Models/ordine";
import Prodotto, { ProdottoInput } from "../Models/prodotto";

/**
 * Estensione dell'interfaccia ProdottoInput con informazioni aggiuntive
 * relative alla relazione con l'ordine.
 */
interface OrdProdEstended extends ProdottoInput {
	id_ord_prod: number;
	is_romana: boolean;
	stato: string;
}

class OrdProdService {
	/**
	 * Crea una lista di ordini-prodotto (OrdProd) nel database.
	 * @param ordini Array di input OrdProd.
	 * @returns Lista di ID dei record inseriti.
	 */
	static async creaOrdiniProdotto(ordini: OrdProdInput[]): Promise<number[]> {
		const idsInseriti: number[] = [];

		for (const ordine of ordini) {
			try {
				const id = await OrdProd.create(ordine);
				idsInseriti.push(id);
			} catch (err) {
				console.error(
					'❌ [SERVICE ERROR] Errore durante la creazione di un OrdProd:',
					err
				);
				throw err; // Interrompe l'esecuzione in caso di errore
			}
		}

		return idsInseriti;
	}

	/**
	 * Recupera tutti i prodotti (estesi) associati a una prenotazione.
	 * @param prenotazioneId ID della prenotazione.
	 * @returns Lista piatta di prodotti estesi oppure null.
	 */
	static async getProdottiByPrenotazione(prenotazioneId: number): Promise<OrdProdEstended[] | null> {
		try {
			const ordini = await Ordine.getByPrenotazione(prenotazioneId);
			if (!ordini || ordini.length === 0) return null;

			// Recupera i prodotti per ciascun ordine
			const prodotti = await Promise.all(
				ordini.map(async (ordine) => {
					return await this.getProdottiByOrdine(ordine.id_ordine);
				})
			);

			// Appiattisce e filtra i risultati null
			return prodotti.flat().filter(p => p !== null) as OrdProdEstended[];
		} catch (error) {
			console.error('❌ [OrdProdService] Errore durante il recupero dei prodotti per la prenotazione:', error);
			throw error;
		}
	}

	/**
	 * Recupera tutti i prodotti (estesi) associati a un ordine.
	 * @param ordineId ID dell'ordine.
	 * @returns Lista di prodotti estesi oppure null.
	 */
	static async getProdottiByOrdine(ordineId: number): Promise<OrdProdEstended[] | null> {
		try {
			const ord_prod = await OrdProd.getByOrdine(ordineId);
			if (!ord_prod || ord_prod.length === 0) return null;

			// Mappa ogni prodotto associato all'ordine in un oggetto esteso
			const prodotti = await Promise.all(
				ord_prod.map(async (op) => {
					const prodotto = await Prodotto.getByID(op.ref_prodotto);
					if (!prodotto) {
						throw new Error(`Prodotto con ID ${op.ref_prodotto} non trovato`);
					}
					return {
						...prodotto,
						id_ord_prod: op.id_ord_prod,
						is_romana: op.is_romana,
						stato: op.stato
					} as OrdProdEstended;
				})
			);
			return prodotti;
		} catch (error) {
			console.error('❌ [OrdProdService] Errore durante il recupero dei prodotti dell\'ordine:', error);
			throw error;
		}
	}

	/**
	 * Cambia lo stato (es. "IN PREPARAZIONE", "SERVITO") di un prodotto nell'ordine.
	 * @param idProdotto ID del record OrdProd.
	 * @param stato Nuovo stato da assegnare.
	 */
	static async cambiaStatoProdottoOrdine(idProdotto: number, stato: string): Promise<void> {
		try {
			await OrdProd.cambiaStato(idProdotto, stato);
		} catch (error) {
			console.error('❌ [OrdProdService] Errore durante il cambio di stato del prodotto dell\'ordine:', error);
			throw error;
		}
	}

	/**
	 * Aggiorna lo stato "romana" di un prodotto in un ordine.
	 * @param idOrdProd ID del record OrdProd.
	 * @param isRomana Booleano che indica se il prodotto è condiviso alla romana.
	 */
	static async aggiornaStatoRomana(idOrdProd: number, isRomana: boolean): Promise<void> {
		try {
			await OrdProd.aggiornaStatoRomana(idOrdProd, isRomana);
		} catch (error) {
			throw new Error(`Errore durante l'aggiornamento dello stato di romane: ${error}`);
		}
	}
}

export default OrdProdService;