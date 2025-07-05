import Prodotto, { ProdottoInput, ProdottoRecord } from '../Models/prodotto';

class ProdottoService {
	/**
	 * Aggiunge un nuovo prodotto nel database.
	 * @param data Dati del prodotto da inserire
	 * @returns ID del prodotto appena inserito
	 */
	static async addProdotto(data: ProdottoInput): Promise<number> {
		try {
			return await Prodotto.create(data);
		} catch (error) {
			console.error('❌ [ProdottoService] Errore durante l\'aggiunta del prodotto:', error);
			throw error;
		}
	}

	/**
	 * Aggiorna un prodotto esistente nel database.
	 * @param data Nuovi dati del prodotto
	 * @param id ID del prodotto da aggiornare
	 */
	static async updateProdotto(data: ProdottoInput, id: number): Promise<void> {
		try {
			await Prodotto.updateProdotto(data, id);
		} catch (error) {
			console.error('❌ [ProdottoService] Errore durante l\'aggiunta del prodotto:', error);
			throw error;
		}
	}

	/**
	 * Elimina un prodotto dal database.
	 * @param id ID del prodotto da eliminare
	 */
	static async deleteProdotto(id: number): Promise<void> {
		try {
			await Prodotto.deleteProdotto(id);
		} catch (error) {
			console.error('❌ [ProdottoService] Errore durante l\'eliminazione del prodotto:', error);
			throw error;
		}
	}

	/**
	 * Imposta un prodotto come "Piatto del Giorno".
	 * Prima disattiva l'eventuale piatto del giorno attuale,
	 * poi attiva quello specificato tramite ID.
	 * @param id ID del nuovo piatto del giorno
	 */
	static async changePiattoDelGiorno(id: number): Promise<void> {
		try {
			await Prodotto.disattivaPiattoDelGiorno();
			await Prodotto.attivaPiattoDelGiorno(id);
		} catch (error) {
			console.error('❌ [ProdottoService] Errore durante il caricamento del piatto del giorno:', error);
			throw error;
		}
	}

	/**
	 * Recupera tutti i prodotti presenti nel database.
	 * @returns Array di prodotti
	 */
	static async getAllProdotti(): Promise<ProdottoRecord[]> {
		try {
			return await Prodotto.getAll();
		} catch (error) {
			console.error('❌ [ProdottoService] Errore durante il recupero dei prodotti:', error);
			throw error;
		}
	}

	/**
	 * Recupera il prodotto attualmente impostato come "Piatto del Giorno".
	 * @returns Il prodotto oppure null se non impostato
	 */
	static async getPiattoDelGiorno(): Promise<ProdottoRecord | null> {
		try {
			return await Prodotto.getPiattoDelGiorno();
		} catch (error) {
			console.error('❌ [ProdottoService] Errore durante il recupero del piatto del giorno:', error);
			throw error;
		}
	}
}

export default ProdottoService;