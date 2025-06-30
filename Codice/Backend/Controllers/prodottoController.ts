import { Request, Response } from 'express';
import ProdottoService from '../Services/prodottoService';
import { ProdottoInput } from '../Models/prodotto';

class ProdottoController {
	static async addProdotto(req: Request, res: Response): Promise<void> {
		try {
			const { nome, descrizione, costo, immagine, categoria} = req.body;

			const newProdotto: ProdottoInput = { nome, descrizione, costo, immagine, categoria};
			const id = await ProdottoService.addProdotto(newProdotto);

			if(id) res.status(201).json({ success: true, data: req.body });
            else res.status(400).json({
                    success: false,
					message: 'Errore durante l\'aggiunta del prodotto',
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
			await ProdottoService.updateProdotto(req.body, parseInt(req.params.id_prodotto));

			res.json({ success: true, message: 'Piatto aggiornato con successo' });
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
				parseInt(req.params.id_prodotto)
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

	static async changePiattoDelGiorno(req: Request, res: Response): Promise<void> {
		try {
			await ProdottoService.changePiattoDelGiorno(
				Number(req.params.id_prodotto)
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

	static async getProdottoDelGiorno(req: Request, res: Response): Promise<void> {
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

			if (prodotti && prodotti.length > 0) res.json({ success: true, data: prodotti });
			else
				res.status(404).json({
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
}

export default ProdottoController;
