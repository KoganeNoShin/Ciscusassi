import { Request, Response } from 'express';
import ProdottoService from '../Services/prodottoService';
import { ProdottoInput } from '../Models/prodotto';

/**
 * Controller per la gestione dei prodotti.
 */
class ProdottoController {
	/**
	 * Aggiunge un nuovo prodotto al sistema.
	 * @param req Richiesta HTTP contenente i dati del prodotto nel body
	 * @param res Risposta HTTP
	 * @returns 201 se inserito con successo, 400 se errore di validazione, 500 se errore server
	 */
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

	/**
	 * Aggiorna un prodotto esistente dato l'ID.
	 * @param req Richiesta HTTP con ID del prodotto nei parametri e dati aggiornati nel body
	 * @param res Risposta HTTP
	 * @returns 200 se aggiornato con successo, 500 se errore
	 */
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

	/**
	 * Elimina un prodotto dato il suo ID.
	 * @param req Richiesta HTTP con ID del prodotto nei parametri
	 * @param res Risposta HTTP
	 * @returns 200 se eliminato con successo, 500 se errore
	 */
	static async deleteProdotto(req: Request, res: Response): Promise<void> {
		try {
			await ProdottoService.deleteProdotto(
				Number(req.params.id_prodotto)
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

	/**
	 * Cambia il prodotto impostato come "piatto del giorno".
	 * @param req Richiesta HTTP con ID del nuovo piatto del giorno nei parametri
	 * @param res Risposta HTTP
	 * @returns 200 se aggiornato con successo, 500 se errore
	 */
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

	/**
	 * Restituisce il piatto del giorno corrente.
	 * @param req Richiesta HTTP
	 * @param res Risposta HTTP
	 * @returns 200 con il piatto del giorno, 500 se errore
	 */
	static async getProdottoDelGiorno(req: Request, res: Response): Promise<void> {
		try {
			const piatto = await ProdottoService.getPiattoDelGiorno();

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

	/**
	 * Restituisce la lista di tutti i prodotti disponibili.
	 * @param req Richiesta HTTP
	 * @param res Risposta HTTP
	 * @returns 200 con lista dei prodotti, 500 se errore
	 */
	static async getAllProdotti(req: Request, res: Response): Promise<void> {
		try {
			const prodotti = await ProdottoService.getAllProdotti();

			res.json({ success: true, data: prodotti });
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
