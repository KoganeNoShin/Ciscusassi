import { Request, Response } from 'express';
import OrdineService from '../Services/ordineService';

class OrdineController {
    static async getAllOrdini(req: Request, res: Response): Promise<void> {
        try {
            const ordini = await OrdineService.getAllOrdini();

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

    static async getOrdineById(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);

        try {
            const ordine = await OrdineService.getOrdineById(id);

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

    static async addOrdine(req: Request, res: Response): Promise<void> {
        const ordineData = req.body;

        try {
            const newOrdineId = await OrdineService.addOrdine(ordineData);
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

    static async updateOrdine(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        const ordineData = req.body;

        try {
            await OrdineService.updateOrdine(ordineData, id);
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

    static async deleteOrdine(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);

        try {
            await OrdineService.deleteOrdine(id);
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
}

export default OrdineController;