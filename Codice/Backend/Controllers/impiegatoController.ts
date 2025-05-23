import { Request, Response } from 'express';
import ImpiegatoService from '../Services/impiegatoService';

class ImpiegatoController {
	static async getAllImpiegati(req: Request, res: Response): Promise<void> {
		try {
			const impiegati = await ImpiegatoService.getAllImpiegati();

			if (impiegati) res.json({ success: true, data: impiegati });
			else
				res.status(400).json({
					success: false,
					message: 'Nessun impiegato trovato',
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

export default ImpiegatoController;
