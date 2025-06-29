import { Request, Response } from 'express';
import OrdProdService from '../Services/ordprodService';

class OrdProdController {
    static async addProdottiOrdine(req: Request, res: Response): Promise<void> {
        const ordini = req.body;
        try {
            const idsInseriti = await OrdProdService.creaOrdiniProdotto(ordini);
            res.status(201).json({ success: true, message: 'Ordini prodotti creati con successo', ids: idsInseriti });
        } catch (err) {
            console.error('❌ Errore nel controller:', err);
            res.status(500).json({ success: false, message: 'Errore interno del server'});
        }
    }

    static async getProdottiByOrdine(req: Request, res: Response): Promise<void> {
        try {
            const ordineId = Number(req.params.id_ordine);

            const prodotti = await OrdProdService.getProdottiByOrdine(ordineId);
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

    static async getProdottiByPrenotazione(req: Request, res: Response): Promise<void> {
        try {
            const prenotazioneId = Number(req.params.prenotazioneId);

            const prodotti = await OrdProdService.getProdottiByPrenotazione(prenotazioneId);

            if (!prodotti || prodotti.length === 0) {
                res.status(404).json({ message: 'Nessun prodotto trovato per la prenotazione' });
                return;
            }

            res.status(200).json(prodotti);
        } catch (error) {
            console.error('[OrdProdController] Errore nel recupero dei prodotti:', error);
            res.status(500).json({ error: 'Errore interno del server' });
        }
    }

    static async cambiaStatoProdottoOrdine(req: Request, res: Response): Promise<void> {
        try {
            const idProdotto = Number(req.params.id);
            const nuovoStato = req.body.stato;

            await OrdProdService.cambiaStatoProdottoOrdine(idProdotto, nuovoStato);
            res.status(200).json({ success: true, message: 'Stato del prodotto aggiornato con successo' });
        } catch (error) {
            console.error('❌ [OrdProdController] Errore durante il cambio di stato del prodotto dell\'ordine:', error);
            res.status(500).json({ success: false, message: 'Errore interno del server' });
        }
    }
}

export default OrdProdController;