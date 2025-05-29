import { Request, Response } from 'express';
import AsportoService, { AsportoData } from '../Services/asportoService';


class AsportoController {
    static async addAsporto(req: Request, res: Response): Promise<void> {
        try {
            const data: AsportoData = req.body;
            
            const result = await AsportoService.addAsporto(data);

            if(result) res.status(201).json({ success: true, data: req.body });
            else res.status(400).json({
                    success: false,
					message: 'Errore durante l\'aggiunta dell\'asporto',
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

export default AsportoController;