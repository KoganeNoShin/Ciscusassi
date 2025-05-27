import Pagamento, { PagamentoInput, PagamentoMensile } from "../Models/pagamento";

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
			if (year < 2000 || year > new Date().getFullYear()) {
				throw new Error('L\'anno deve essere compreso tra il 2000 e l\'anno corrente.');
			}

			const pagamentoMensile: PagamentoMensile[] = [
				{ mese: 'Gennaio', importo: 0 },
				{ mese: 'Febbraio', importo: 0 },
				{ mese: 'Marzo', importo: 0 },
				{ mese: 'Aprile', importo: 0 },
				{ mese: 'Maggio', importo: 0 },
				{ mese: 'Giugno', importo: 0 },
				{ mese: 'Luglio', importo: 0 },
				{ mese: 'Agosto', importo: 0 },
				{ mese: 'Settembre', importo: 0 },
				{ mese: 'Ottobre', importo: 0 },
				{ mese: 'Novembre', importo: 0 },
				{ mese: 'Dicembre', importo: 0 }
			];
			
			const pagamenti = await Pagamento.getByYear(year);
			for (const p of pagamenti) {
				const dataPagamento = new Date(p.data_ora_pagamento);
				const mese = dataPagamento.getMonth();

				pagamentoMensile[mese].importo += p.importo;
			}

			return pagamentoMensile;
		} catch (error) {
			console.error('❌ [PagamentoService] Errore durante il recupero dei pagamenti:', error);
			throw error;
		}
	}
}

export default PagamentoService;