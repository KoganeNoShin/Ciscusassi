import { Request, Response } from 'express';
import OrdProdService from '../Services/ordprodService';

class OrdProdController {
    static async getProdottiByOrdine(req: Request, res: Response): Promise<void> {
        try {
            const ordineId = parseInt(req.params.id);
            if (isNaN(ordineId)) {
                res.status(400).json({ success: false, message: 'ID ordine non valido' });
                return;
            }

            const prodotti = await OrdProdService.getProdottiByOrdine(ordineId, req.query.romana === 'true');
            if (prodotti) {
                res.status(200).json({ success: true, data: prodotti });
            } else {
                res.status(404).json({ success: false, message: 'Nessun prodotto trovato per questo ordine' });
            }
        } catch (error) {
            console.error('❌ [OrdProdController] Errore durante il recupero dei prodotti dell\'ordine:', error);
            res.status(500).json({ success: false, message: 'Errore interno del server'});
        }
    }
}

export default OrdProdController;


	

    // static async getProdottiByOrdine(req: Request, res: Response): Promise<void> {

    // static async cambiaStatoProdottoOrdine(req: Request, res: Response): Promise<void> {