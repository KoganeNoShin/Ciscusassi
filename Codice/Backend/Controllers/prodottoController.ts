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
				error: (err instanceof Error ? err.message : String(err))
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
				error: (err instanceof Error ? err.message : String(err))
			});
		}
	}

	static async addProdotto(req: Request, res: Response): Promise<void> {
		try {

			const { nome, descrizione, costo, immagine, categoria, isPiattoGiorno} = req.body;

			if (!nome || !descrizione || costo == null || !immagine || !categoria || isPiattoGiorno === undefined) {
				res.status(400).json({
					success: false,
					message: 'Campi obbligatori mancanti: nome, descrizione, costo, immagine, categoria, piatto del giorno',
				});
			}

			const piatto = await ProdottoService.addProdotto(req.body);

			if (piatto) res.json({ success: true, data: piatto });
			else
				res.status(400).json({
					success: false,
					message: 'Errore durante l\'aggiunta del piatto'
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

	static async updateProdotto(req: Request, res: Response): Promise<void> {
		try {
			const piatto = await ProdottoService.updateProdotto(
				req.body,
				parseInt(req.params.id)
			);

			res.json({ success: true, data: piatto });
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
				error: (err instanceof Error ? err.message : String(err))
			});
		}
	}

	static async deleteProdotto(req: Request, res: Response): Promise<void> {
		try {
			await ProdottoService.deleteProdotto(
				parseInt(req.params.id)
			);

			res.json({ success: true, message: 'Piatto eliminato con successo' });
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
				error: (err instanceof Error ? err.message : String(err))
			});
		}
	}

	static async chargePiattoDelGiorno(req: Request, res: Response): Promise<void> {
		try {
			await ProdottoService.chargePiattoDelGiorno(
				parseInt(req.params.id)
			);

			res.json({ success: true, message: 'Piatto del giorno cambiato con successo' });
		} catch (err) {
			console.error("Errore interno:", err);
			res.status(500).json({
				success: false,
				message: "Errore interno del server",
				error: (err instanceof Error ? err.message : String(err))
			});
		}
	}
}

export default ProdottoController;
