import AspProd, { AspProdInput } from "../Models/asp_prod";
import Asporto, { AsportoInput } from "../Models/asporto";
import Pagamento, { PagamentoInput } from "../Models/pagamento";

export interface AsportoData {
    indirizzo: string,
    data_ora_consegna: string,
    ref_cliente: number,
    ref_filiale: number,
    importo: number,
    data_ora_pagamento: string,
    prodotti: number[]
}

class AsportoService {
    static async addAsporto(data: AsportoData): Promise<number> {
        const pagamentoData = {importo: data.importo, data_ora_pagamento: data.data_ora_pagamento} as PagamentoInput;
        const id_pagamento = await Pagamento.create(pagamentoData);
        if(!id_pagamento) {
            throw new Error("Creazione del pagamento fallita.");
        }

        const asportoData = {indirizzo: data.indirizzo, data_ora_consegna: data.data_ora_consegna, ref_cliente: data.ref_cliente, ref_pagamento: id_pagamento, ref_filiale: data.ref_filiale} as AsportoInput;
        const id_asporto = await Asporto.create(asportoData);
        if(!id_asporto) {
            throw new Error("Creazione dell'asporto fallia.")
        }

        for(const p of data.prodotti) {
            const asp_prod = {ref_asporto: id_asporto, ref_prodotto: p} as AspProdInput;
            const id_AspProd = await AspProd.create(asp_prod);
            if(!id_AspProd) {
                throw new Error(`Aggiunta del prodotto ${p} fallita.`)
            }
        }
        return id_asporto;
    }
}

export default AsportoService;