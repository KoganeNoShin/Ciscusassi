import Pagamento, { PagamentoInput, PagamentoRecord } from "../Models/pagamento";

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
}

export default PagamentoService;