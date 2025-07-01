import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../Middleware/authMiddleware';
import OrdineService from '../Services/ordineService';
import { OrdineInput } from '../Models/ordine';

class OrdineController {
    static async addOrdine(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const {ref_prenotazione, username_ordinante} = req.body;
            const ref_cliente = req.user?.id ? Number(req.user.id) : null;

            const ordineInput: OrdineInput = {ref_prenotazione, username_ordinante, ref_cliente};
            const ordine = await OrdineService.creaOrdine(ordineInput);
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
            await OrdineService.aggiungiPagamento(req.body.ref_pagamento, req.body.data_ora_pagamento, req.body.id_ordine);
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

    static async getIDOrdineByPrenotazioneAndUsername(req: Request, res: Response): Promise<void> {
        try{
            const idPrenotazione: number = Number(req.params.id_prenotazione);
            const username = req.params.username;
            const idOrdine = await OrdineService.getIDOrdineByPrenotazioneAndUsername(idPrenotazione, username);

            if(idOrdine) res.status(201).json({ 
                success: true, 
                data: idOrdine
            });
            else res.status(400).json({
                    success: false,
					message: 'Ordine non trovato',
			});
        }catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: (err instanceof Error ? err.message : String(err))
            });
        }
    }

    static async calcolaImportoTotale(req: Request, res: Response): Promise<void> {
        const ordineId  = Number(req.params.idOrdine);

        try {
            const totale = await OrdineService.calcolaImportoTotale(ordineId);

            res.json({
                success: true,
                totale: totale
            });
        } catch (error) {
            console.error('❌ [Controller] Errore durante il calcolo del totale:', error);
            res.status(500).json({
                success: false,
                message: `Errore durante il calcolo del totale: ${error}`
            });
        }
    }
}

export default OrdineController;