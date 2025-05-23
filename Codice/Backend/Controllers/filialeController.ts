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

	static async addFiliale(req: Request, res: Response): Promise<void> {
		try {
			const filiale = await FilialeService.addFiliale(req.body);

			if (filiale) res.json({ success: true, data: filiale });
			else
				res.status(400).json({
					success: false,
					message: 'Errore durante l\'aggiunta della filiale',
				});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
			});
		}
	}

	static async updateFiliale(req: Request, res: Response): Promise<void> {
		try {
			const filiale = await FilialeService.updateFiliale(
				req.body,
				parseInt(req.params.id)
			);

			res.json({ success: true, data: filiale });
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
			});
		}
	}

	static async deleteFiliale(req: Request, res: Response): Promise<void> {
		try {
			await FilialeService.deleteFiliale(parseInt(req.params.id));

			res.json({ success: true, message: 'Filiale eliminata con successo' });
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
