import { Request, Response } from 'express';
import FilialeService from '../Services/filialeService';

/**
 * Controller per la gestione delle operazioni CRUD sulle filiali.
 */
class FilialeController {
	/**
	 * Aggiunge una nuova filiale.
	 * 
	 * @param req Richiesta HTTP contenente i dati della filiale nel corpo
	 * @param res Risposta HTTP con esito dell’operazione
	 * 
	 * @returns 201 con `data` se creazione avvenuta, 400 o 500 altrimenti
	 */
	static async addFiliale(req: Request, res: Response): Promise<void> {
		try {
			const filiale = await FilialeService.addFiliale(req.body);

			if (filiale)
				res.status(201).json({ success: true, data: req.body });
			else
				res.status(400).json({
					success: false,
					message: "Errore durante l'aggiunta della filiale",
				});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
				error: err instanceof Error ? err.message : String(err),
			});
		}
	}

	/**
	 * Aggiorna una filiale esistente dato il suo ID.
	 * 
	 * @param req Richiesta contenente l’ID della filiale nei parametri e i nuovi dati nel body
	 * @param res Risposta con i dati aggiornati o errore
	 * 
	 * @returns 200 con `data` se aggiornamento riuscito, 500 in caso di errore
	 */
	static async updateFiliale(req: Request, res: Response): Promise<void> {
		try {
			const filiale = await FilialeService.updateFiliale(
				req.body,
				parseInt(req.params.id_filiale)
			);

			res.json({ success: true, data: filiale });
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
				error: err instanceof Error ? err.message : String(err),
			});
		}
	}

	/**
	 * Elimina una filiale dato il suo ID.
	 * 
	 * @param req Richiesta contenente l’ID della filiale da eliminare
	 * @param res Risposta con conferma di eliminazione o errore
	 * 
	 * @returns 200 con messaggio di conferma, 500 in caso di errore
	 */
	static async deleteFiliale(req: Request, res: Response): Promise<void> {
		try {
			await FilialeService.deleteFiliale(parseInt(req.params.id_filiale));

			res.json({
				success: true,
				message: 'Filiale eliminata con successo',
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
				error: err instanceof Error ? err.message : String(err),
			});
		}
	}

	/**
	 * Recupera la lista di tutte le filiali esistenti.
	 * 
	 * @param req Richiesta HTTP
	 * @param res Risposta contenente l’elenco delle filiali o messaggio di errore
	 * 
	 * @returns 200 con array di filiali, 400 se vuoto, 500 se errore server
	 */
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
				error: err instanceof Error ? err.message : String(err),
			});
		}
	}
}

export default FilialeController;