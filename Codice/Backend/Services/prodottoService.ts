import Prodotto, { ProdottoInput, ProdottoRecord } from '../Models/prodotto';

class ProdottoService {
	static async addProdotto(data: ProdottoInput): Promise<number> {
		try {
			return await Prodotto.create(data);
		} catch (error) {
			console.error('❌ [ProdottoService] Errore durante l\'aggiunta del prodotto:', error);
			throw error;
		}
	}

	static async updateProdotto(data: ProdottoInput, id: number): Promise<void> {
		try {
			await Prodotto.updateProdotto(data, id);
		} catch (error) {
			console.error('❌ [ProdottoService] Errore durante l\'aggiunta del prodotto:', error);
			throw error;
		}
	}

	static async deleteProdotto(id: number): Promise<void> {
		try {
			await Prodotto.deleteProdotto(id);
		} catch (error) {
			console.error('❌ [ProdottoService] Errore durante l\'eliminazione del prodotto:', error);
			throw error;
		}
	}

	static async chargePiattoDelGiorno(id: number): Promise<void> {
		try {
			await Prodotto.disattivaPiattoDelGiorno();

			await Prodotto.attivaPiattoDelGiorno(id);
		} catch (error) {
			console.error('❌ [ProdottoService] Errore durante il caricamento del piatto del giorno:', error);
			throw error;
		}
	}

	static async getAllProdotti(): Promise<ProdottoRecord[]> {
		try {
			return await Prodotto.getAll();
		} catch (error) {
			console.error('❌ [ProdottoService] Errore durante il recupero dei prodotti:', error);
			throw error;
		}
	}

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