import Ordine, { OrdineInput, OrdineRecord } from "../Models/ordine";

class OrdineService {
    static async getAllOrdini(): Promise<OrdineRecord[]> {
        const ordini = await Ordine.findAll();
        return ordini || [];
    }

    static async getOrdineById(id: number): Promise<OrdineRecord | null> {
        const ordine = await Ordine.findById(id);
        return ordine || null;
    }

    static async addOrdine(input: OrdineInput): Promise<number> {
        const ordineData: OrdineInput = {
            username_ordinante: input.username_ordinante,
            data_ora_ordinazione: input.data_ora_ordinazione,
            ref_prenotazione: input.ref_prenotazione,
            ref_cliente: input.ref_cliente,
            ref_pagamento: input.ref_pagamento,
        };

        return await Ordine.addOrdine(ordineData);
    }

    static async updateOrdine(input: OrdineInput, id: number): Promise<void> {
        const ordineData: OrdineInput = {
            username_ordinante: input.username_ordinante,
            data_ora_ordinazione: input.data_ora_ordinazione,
            ref_prenotazione: input.ref_prenotazione,
            ref_cliente: input.ref_cliente,
            ref_pagamento: input.ref_pagamento,
        };

        return await Ordine.updateOrdine(ordineData, id);
    }

    static async deleteOrdine(id: number): Promise<void> {
        return await Ordine.deleteOrdine(id);
    }
}

export default OrdineService;