import Pagamento, { PagamentoInput , PagamentoMensile } from "../Models/pagamento";
import Filiale from "../Models/filiale";

class PagamentoService {
	private static validate(input: PagamentoInput): void {
		if (input.importo <= 0) {
			throw new Error('L\'importo deve essere maggiore di zero.');
		}

		const timestamp = Date.parse(input.data_ora_pagamento);
		if (isNaN(timestamp)) {
			throw new Error('La data di pagamento non è valida.');
		}

		const dataPagamento = new Date(timestamp);

		const adesso = new Date();

		const ieri = new Date();
		ieri.setHours(0, 0, 0, 0);
		ieri.setDate(adesso.getDate() - 1);

		if (!(dataPagamento.getTime() >= ieri.getTime() && dataPagamento.getTime() <= adesso.getTime())){
			throw new Error("La data di pagamento deve essere oggi o ieri.");
		}
	}

	static async addPagamento(data: PagamentoInput): Promise<number> {
		this.validate(data);
		return await Pagamento.create(data);
	}

	static async getPagamentoByYear(year: number): Promise<PagamentoMensile[]> {
		try {
			if( year < 2000 || year > new Date().getFullYear()) {
				throw new Error('L\'anno deve essere compreso tra il 2000 e l\'anno corrente.');
			}

			const meseNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

			const filiali = await Filiale.getAll();
			if (!filiali || filiali.length === 0) {
				throw new Error('Nessuna filiale trovata.');
			}
			const ref_filiali: number[] = filiali.map((f) => f.id_filiale);

			const pagamentoMensile: PagamentoMensile[] = [];

			for(const f of ref_filiali) {
				for(const m of meseNames) {
					pagamentoMensile.push({
						data : m,
						importo: 0,
						filiale: f
					});
				}
			}

			const pagamentiOrdini = await Pagamento.getPagamentiOrdiniByYear(year);
			const pagamentiAsporto = await Pagamento.getPagamentiAsportiByYear(year);
			const pagamenti = [...pagamentiOrdini, ...pagamentiAsporto];

			for(const p of pagamenti) {
				const meseIndex = new Date(p.data).getMonth();

				const index = pagamentoMensile.findIndex(pagamento => pagamento.filiale === p.filiale && pagamento.data === meseNames[meseIndex]);

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