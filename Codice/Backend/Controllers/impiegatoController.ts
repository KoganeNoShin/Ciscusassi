import { Request, Response } from 'express';
import ImpiegatoService from '../Services/impiegatoService';
import { AuthenticatedRequest } from '../Middleware/authMiddleware';

/**
 * Controller per la gestione degli impiegati.
 */
class ImpiegatoController {
	/**
	 * Aggiunge un nuovo impiegato.
	 * 
	 * @param req Richiesta HTTP contenente i dati dell’impiegato
	 * @param res Risposta HTTP con ID del nuovo impiegato o errore
	 * 
	 * @returns 201 se creazione avvenuta, 500 in caso di errore
	 */
	static async addImpiegato(req: Request, res: Response): Promise<void> {
		try {
			const {
				nome,
				cognome,
				ruolo,
				foto,
				email,
				data_nascita,
				ref_filiale,
			} = req.body;

			const id = await ImpiegatoService.addImpiegato(
				nome,
				cognome,
				ruolo,
				foto,
				email,
				data_nascita,
				ref_filiale
			);
			res.status(201).json({ success: true, data: id });
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
	 * Aggiorna i dati di un impiegato esistente.
	 * 
	 * @param req Richiesta con param `matricola` e nuovi dati nel body
	 * @param res Risposta di successo o errore
	 * 
	 * @returns 200 se aggiornamento riuscito, 500 in caso di errore
	 */
	static async updateImpiegato(req: Request, res: Response): Promise<void> {
		try {
			await ImpiegatoService.updateImpiegato(
				req.body,
				parseInt(req.params.matricola)
			);
			res.json({
				success: true,
				message: 'Impiegato aggiornato con successo',
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
	 * Elimina un impiegato dato il suo numero di matricola.
	 * 
	 * @param req Richiesta contenente `matricola` nei parametri
	 * @param res Risposta con conferma eliminazione o errore
	 * 
	 * @returns 200 se eliminazione riuscita, 500 in caso di errore
	 */
	static async deleteImpiegato(req: Request, res: Response): Promise<void> {
		try {
			await ImpiegatoService.deleteImpiegato(
				parseInt(req.params.matricola)
			);
			res.json({
				success: true,
				message: 'Impiegato eliminato con successo',
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
	 * Restituisce tutti gli impiegati associati a una filiale specifica.
	 * 
	 * @param req Richiesta contenente l’ID della filiale nei parametri
	 * @param res Risposta con array di impiegati o messaggio
	 * 
	 * @returns 200 con dati o messaggio vuoto, 400 se ID non valido, 500 in caso di errore
	 */
	static async getAllImpiegati(req: Request, res: Response): Promise<void> {
		try {
			const idFiliale = Number(req.params.id_filiale);
			if (isNaN(idFiliale)) {
				res.status(400).json({
					success: false,
					message: 'ID filiale non valido',
				});
				return;
			}

			const impiegati = await ImpiegatoService.getByFiliale(idFiliale);

			if (impiegati && impiegati.length > 0) {
				res.json({ success: true, data: impiegati });
			} else {
				res.status(200).json({
					success: true,
					message:
						'Nessun impiegato trovato per la filiale specificata',
				});
			}
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
	 * Aggiorna la password dell'impiegato autenticato.
	 * 
	 * @param req Richiesta autenticata contenente la nuova password
	 * @param res Risposta HTTP
	 * 
	 * @returns 200 se aggiornamento riuscito,
	 *          500 in caso di errore interno
	 */
	static async aggiornaPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
		try {
			const matricola = Number(req.user?.id);

			await ImpiegatoService.aggiornaPassword(matricola, req.body.nuovaPassword);

			res.status(200).json({ success: true, message: 'Password aggiornata con successo' });
		} catch (err) {
			console.error('❌ [ImpiegatoController] Errore in aggiornaPasswordImpiegato:', err);
			res.status(500).json({ error: 'Errore durante l\'aggiornamento della password' });
		}
	}
}

export default ImpiegatoController;