import { Request, Response } from 'express';
import AsportoService from '../Services/asportoService';
import PagamentoService from '../Services/pagamentoService';
import AspProdService from '../Services/asp_prodService';
import { PagamentoInput } from '../Models/pagamento';
import { AsportoInput } from '../Models/asporto';

class AsportoController {
    static async addAsporto(req: Request, res: Response): Promise<void> {
        try {
            const {indirizzo, data_ora_consegna, ref_cliente, importo, data_ora_pagamento, prodotti} = req.body;

            if(!Array.isArray(prodotti) || prodotti.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Devi specificare almeno un prodotto per l\'asporto'
                });
                return;
            }

            const pagamentoData = {importo, data_ora_pagamento} as PagamentoInput;
            const ref_pagamento = await PagamentoService.addPagamento(pagamentoData);

            const asportoData = {indirizzo, data_ora_consegna, ref_cliente, ref_pagamento} as AsportoInput;
            const asporto = await AsportoService.addAsporto(asportoData);

            await Promise.all(prodotti.map((ref_prodotto: number) => {
                AspProdService.addAspProd(asporto, ref_prodotto);
            }));

            res.status(201).json({ success: true, data: asporto });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: (err instanceof Error ? err.message : String(err))
            });
        }
    }
}

export default AsportoController;