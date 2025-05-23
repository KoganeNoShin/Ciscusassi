import { Request, Response } from 'express';
import Ord_prod from '../Services/ord_prodService';

class OrdineProdottoController {
    static async getAllOrdini(req: Request, res: Response): Promise<void> {
        try {
            const ordini = await Ord_prod.getAll();

            if (ordini) res.json({ success: true, data: ordini });
            else
                res.status(404).json({
                    success: false,
                    message: 'Nessun ordine trovato',
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

    static async getById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);

        try {
            const ordine = await Ord_prod.getById(id);

            if (ordine) res.json({ success: true, data: ordine });
            else
                res.status(404).json({
                    success: false,
                    message: 'Ordine non trovato',
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

    static async getByRefOrdine(req: Request, res: Response): Promise<void> {
        const ref_ordine = parseInt(req.params.ref_ordine);

        try {
            const ordine = await Ord_prod.getByRefOrdine(ref_ordine);

            if (ordine) res.json({ success: true, data: ordine });
            else
                res.status(404).json({
                    success: false,
                    message: 'Ordine non trovato',
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

    static async addOrdineProdotto(req: Request, res: Response): Promise<void> {
        const { ref_ordine, ref_prodotto } = req.body;

        try {
            const newOrdineId = await Ord_prod.addOrdProd(ref_ordine, ref_prodotto);
            res.status(201).json({
                success: true,
                message: 'Ordine creato con successo',
                data: { id: newOrdineId },
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

    static async deleteOrdineProdotto(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);

        try {
            await Ord_prod.deleteOrdProd(id);
            res.json({
                success: true,
                message: 'Ordine eliminato con successo',
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

    static async cambiaRomana(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);

        try {
            await Ord_prod.cambiaRomana(id);
            res.json({
                success: true,
                message: 'Ordine aggiornato con successo',
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

    static async cambioStato(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        const { stato } = req.body;

        try {
            await Ord_prod.cambioStato(id, stato);
            res.json({
                success: true,
                message: 'Ordine aggiornato con successo',
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
}

export default OrdineProdottoController;