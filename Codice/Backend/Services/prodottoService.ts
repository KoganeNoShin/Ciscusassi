import Prodotto, { ProdottoInput, ProdottoRecord } from '../Models/prodotto';

class ProdottoService {
	private static validate(data: ProdottoInput): void {
		const categorieValide = ['ANTIPASTO', 'PRIMO', 'DOLCE', 'BEVANDA'];
		if (!categorieValide.includes(data.categoria)) {
			throw new Error(`Categoria non valida: ${data.categoria}. Le categorie ammesse sono: ${categorieValide.join(', ')}`);
		}
		if (data.costo <= 0) {
			throw new Error('Il costo deve essere maggiore di zero.');
		}
		if (!data.nome || !data.descrizione || data.nome.trim() === '' || data.descrizione.trim() === '') {
			throw new Error('Nome e descrizione sono obbligatori.');
		}
		if (!data.immagine || data.immagine.trim() === '') {
			throw new Error('L\'immagine è obbligatoria.');
		}
	}


	static async addProdotto(data: ProdottoInput): Promise<number> {
		try {
			this.validate(data);
			return await Prodotto.create(data);
		} catch (error) {
			console.error('❌ [ProdottoService] Errore durante l\'aggiunta del prodotto:', error);
			throw error;
		}
	}

	static async updateProdotto(data: ProdottoInput, id: number): Promise<void> {
		try {
			this.validate(data);
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