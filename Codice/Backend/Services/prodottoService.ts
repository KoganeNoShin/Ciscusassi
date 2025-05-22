import Prodotto, { ProdottoRecord } from '../Models/prodotto';

class ProdottoService {
	static async getPiattoDelGiorno(): Promise<ProdottoRecord | null> {
		const piatto = await Prodotto.getPiattoDelGiorno();
		return piatto || null;
	}

	static async getAllProdotti(): Promise<ProdottoRecord[] | null> {
		const piatti = await Prodotto.findAll();
		return piatti || null;
	}
}

export default ProdottoService;
