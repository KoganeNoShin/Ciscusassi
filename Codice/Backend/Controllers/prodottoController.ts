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

	static async addProdotto(req: Request, res: Response): Promise<void> {
		try {
			const piatto = await ProdottoService.addProdotto(req.body);

			if (piatto) res.json({ success: true, data: piatto });
			else
				res.status(400).json({
					success: false,
					message: 'Errore durante l\'aggiunta del piatto',
				});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
			});
		}
	}

	static async updateProdotto(req: Request, res: Response): Promise<void> {
		try {
			const piatto = await ProdottoService.updateProdotto(
				req.body,
				parseInt(req.params.id)
			);

			if (piatto) res.json({ success: true, data: piatto });
			else
				res.status(400).json({
					success: false,
					message: 'Errore durante l\'aggiornamento del piatto',
				});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
			});
		}
	}

	static async deleteProdotto(req: Request, res: Response): Promise<void> {
		try {
			const piatto = await ProdottoService.deleteProdotto(
				parseInt(req.params.id)
			);

			if (piatto) res.json({ success: true, data: piatto });
			else
				res.status(400).json({
					success: false,
					message: 'Errore durante l\'eliminazione del piatto',
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
