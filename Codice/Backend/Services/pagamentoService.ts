import Pagamento, { PagamentoInput, PagamentoRecord } from "../Models/pagamento";

class PagamentoService {
    static async addPagamento(input: PagamentoInput): Promise<number> {
        return await Pagamento.create(input);
    }

    static async deletePagamento(id: number): Promise<void> {
        return await Pagamento.deletePagamento(id);
    }

    static async updatePagamento(id: number, input: PagamentoInput): Promise<void> {
        return await Pagamento.updatePagamento(id, input);
    }

    static async getAllPagamenti(): Promise<PagamentoRecord[] | null> {
        return await Pagamento.findAll();
    }

    static async getPagamentoById(id: number): Promise<PagamentoRecord | null> {
        return await Pagamento.findById(id);
    }
}

export default PagamentoService;