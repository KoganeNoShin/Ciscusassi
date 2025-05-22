import { Request, Response } from 'express';
import ProdottoService from '../Services/prodottoService';

class ProdottoController {
	static async getprodottoDelGiorno(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			const piatto = await ProdottoService.getPiattoDelGiorno();

			if (piatto) res.json({ success: true, data: piatto });
			else
				res.status(404).json({
					success: false,
					message: 'Nessun piatto del giorno trovato',
				});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
			});
		}
	}

	static async getAllProdotti(req: Request, res: Response): Promise<void> {
		try {
			const prodotti = await ProdottoService.getAllProdotti();

			if (prodotti) res.json({ success: true, data: prodotti });
			else
				res.status(400).json({
					success: false,
					message: 'Nessun piatto trovato',
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

export default ProdottoController;
