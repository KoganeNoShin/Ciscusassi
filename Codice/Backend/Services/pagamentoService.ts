import Pagamento, { PagamentoMensile } from "../Models/pagamento";
import Filiale from "../Models/filiale";

class PagamentoService {
	/**
	 * Restituisce un array di pagamenti mensili aggregati per filiale e mese per un determinato anno.
	 *
	 * @param year - L'anno per cui si vogliono calcolare i pagamenti (deve essere >= 2000 e <= anno corrente).
	 * @returns Una lista di oggetti `PagamentoMensile`, uno per ogni combinazione filiale-mese.
	 * 
	 * Il calcolo include sia pagamenti da ordini interni che pagamenti da asporto.
	 * Se nessuna filiale è trovata, o se l'anno è fuori dal range valido, viene sollevato un errore.
	 * 
	 * @throws Errore se l'anno è fuori range o se ci sono problemi nel recupero dei dati.
	 */
	static async getPagamentoByYear(year: number): Promise<PagamentoMensile[]> {
		try {
			if (year < 2000 || year > new Date().getFullYear()) {
				throw new Error('L\'anno deve essere compreso tra il 2000 e l\'anno corrente.');
			}

			const meseNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

			const filiali = await Filiale.getAll();
			if (!filiali || filiali.length === 0) {
				throw new Error('Nessuna filiale trovata.');
			}
			const ref_filiali: number[] = filiali.map((f) => f.id_filiale);

			const pagamentoMensile: PagamentoMensile[] = [];

			for (const f of ref_filiali) {
				for (const m of meseNames) {
					pagamentoMensile.push({
						data: m,
						importo: 0,
						filiale: f
					});
				}
			}

			const pagamentiOrdini = await Pagamento.getPagamentiOrdiniByYear(year);
			const pagamentiAsporto = await Pagamento.getPagamentiAsportiByYear(year);
			const pagamenti = [...pagamentiOrdini, ...pagamentiAsporto];

			for (const p of pagamenti) {
				const meseIndex = new Date(p.data).getMonth();

				const index = pagamentoMensile.findIndex(pagamento =>
					pagamento.filiale === p.filiale && pagamento.data === meseNames[meseIndex]
				);

				if (index !== -1) {
					pagamentoMensile[index].importo += p.importo;
				}
			}

			return pagamentoMensile;
		} catch (error) {
			console.error('❌ [PagamentoService] Errore durante il recupero dei pagamenti:', error);
			throw error;
		}
	}
}

export default PagamentoService;