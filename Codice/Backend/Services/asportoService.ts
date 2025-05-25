import Asporto, { AsportoInput } from "../Models/asporto";
import Cliente from "../Models/cliente";
import Pagamento from "../Models/pagamento";

class AsportoService {
    private static async validate(input: AsportoInput): Promise<void> {
        if (!input.indirizzo || input.indirizzo.trim() === '') {
            throw new Error('L\'indirizzo non può essere vuoto.');
        }

        const timestamp = Date.parse(input.data_ora_consegna);
        if (isNaN(timestamp)) {
            throw new Error('La data di consegna non è valida.');
        }
        const dataConsegna = new Date(timestamp);
        const adesso = new Date();
        if (dataConsegna.getTime() < adesso.getTime()) {
            throw new Error('La data di consegna deve essere nel futuro.');
        }

        const cliente = await Cliente.findByNumeroCarta(input.ref_cliente);
        if(!cliente) {
            throw new Error(`Cliente con ID ${input.ref_cliente} non esiste.`);
        }

        const pagamento = await Pagamento.getByID(input.ref_pagamento);
        if(!pagamento) {
            throw new Error(`Pagamento con ID ${input.ref_pagamento} non esiste.`);
        }
    }

    static async addAsporto(data: AsportoInput): Promise<number> {
        await this.validate(data);
        return await Asporto.create(data);
    }
}

export default AsportoService;