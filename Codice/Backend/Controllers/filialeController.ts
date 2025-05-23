import { Request, Response } from 'express';
import FilialeService from '../Services/filialeService';

class FilialeController {
	static async getAllFiliali(req: Request, res: Response): Promise<void> {
		try {
			const filiali = await FilialeService.getAllFiliali();

			if (filiali) res.json({ success: true, data: filiali });
			else
				res.status(400).json({
					success: false,
					message: 'Nessuna filiale trovata',
				});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
			});
		}
	}
}

export default FilialeController;
