import { Request, Response } from 'express';
import OrdineService from '../Services/ordineService';

class OrdineController {
    static async addOrdine(req: Request, res: Response): Promise<void> {
        try {
            const ordine = await OrdineService.creaOrdine(req.body);
            if(ordine) res.status(201).json({ 
                success: true, 
                data: {
                    body: req.body,
                    id_ordine: ordine
                }
            });
            else res.status(400).json({
                    success: false,
					message: 'Errore durante l\'aggiunta dell\'ordine',
			});
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: (err instanceof Error ? err.message : String(err))
            });
        }
    }

    static async addPagamento(req: Request, res: Response): Promise<void> {
        try {
            await OrdineService.aggiungiPagamento(req.body.ref_pagamento, req.body.id_ordine);
            res.json({ success: true, message: 'Pagamento aggiunto con successo' });
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

export default OrdineController;