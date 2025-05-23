import Prodotto, { ProdottoInput, ProdottoRecord } from '../Models/prodotto';

class ProdottoService {
	static async getPiattoDelGiorno(): Promise<ProdottoRecord | null> {
		const piatto = await Prodotto.getPiattoDelGiorno();
		return piatto || null;
	}

	static async getAllProdotti(): Promise<ProdottoRecord[] | null> {
		const piatti = await Prodotto.findAll();
		return piatti || null;
	}

	static async addProdotto(input: ProdottoInput): Promise<number | null> {
		const piattoData: ProdottoInput = {
			nome: input.nome,
			descrizione: input.descrizione,
			costo: input.costo,
			immagine: input.immagine,
			categoria: input.categoria,
			is_piatto_giorno: input.is_piatto_giorno,
		};

		return await Prodotto.addProdotto(piattoData);
	}

	static async updateProdotto(input: ProdottoInput, id: number): Promise<void> {
		const piattoData: ProdottoInput = {
			nome: input.nome,
			descrizione: input.descrizione,
			costo: input.costo,
			immagine: input.immagine,
			categoria: input.categoria,
			is_piatto_giorno: input.is_piatto_giorno,
		};

		return await Prodotto.updateProdotto(piattoData, id);
	}

	static async deleteProdotto(id: number): Promise<void> {
		return await Prodotto.deleteProdotto(id);
	}

	static async chargePiattoDelGiorno(id: number): Promise<void> {
		return await Prodotto.chargePiattoDelGiorno(id);
	}
}

export default ProdottoService;
