import {Request, Response} from 'express';
import PagamentoService from '../Services/pagamentoService';

class PagamentoController {
    /*
    static async getPagamentiByYear(req: Request, res: Response): Promise<void> {
        try {
            const year = parseInt(req.params.year);
            if (isNaN(year)) {
                res.status(400).json({ success: false, message: 'Anno non valido' });
                return;
            }

            const pagamenti = await PagamentoService.getPagamentoByYear(year);
            res.json({ success: true, data: pagamenti });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: (err instanceof Error ? err.message : String(err))
            });
        }
    }
        */
}

export default PagamentoController;