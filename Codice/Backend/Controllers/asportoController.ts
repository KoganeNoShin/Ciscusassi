import { Request, Response } from 'express';
import AsportoService from '../Services/asportoService';

class AsportoController {
    static async getAllAsporti(req: Request, res: Response): Promise<void> {
        try {
            const asporti = await AsportoService.getAllAsporti();
            res.json({ success: true, data: asporti });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: (err instanceof Error ? err.message : String(err))
            });
        }
    }

    static async addAsporto(req: Request, res: Response): Promise<void> {
        try {
            const asporto = await AsportoService.addAsporto(req.body);
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

    static async updateAsporto(req: Request, res: Response): Promise<void> {
        try {
            await AsportoService.updateAsporto(
                parseInt(req.params.id),
                req.body
            );
            res.json({ success: true, message: 'Asporto aggiornato con successo' });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: (err instanceof Error ? err.message : String(err))
            });
        }
    }

    static async deleteAsporto(req: Request, res: Response): Promise<void> {
        try {
            await AsportoService.deleteAsporto(parseInt(req.params.id));
            res.json({ success: true, message: 'Asporto eliminato con successo' });
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