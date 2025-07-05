import { Request, Response } from 'express';
import TorrettaService from '../Services/torrettaService';

class TorrettaController {
    static async getTorrettaByID(req: Request, res: Response): Promise<void> {
        try {
            const id_torretta = Number(req.params.id_torretta);
            const torretta = await TorrettaService.getTorrettaByID(id_torretta);
            if (torretta) {
                res.status(200).json({ success: true, data: torretta });
            } 
        } catch (error) {
            console.error('❌ [TorrettaController] Errore durante il recupero della torretta:', error);
            res.status(500).json({ success: false, message: 'Errore interno del server', error: (error instanceof Error ? error.message : String(error)) });
        }
    }
}

export default TorrettaController;