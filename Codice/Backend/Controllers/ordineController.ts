import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../Middleware/authMiddleware';
import OrdineService from '../Services/ordineService';
import { OrdineInput } from '../Models/ordine';

/**
 * Controller per la gestione degli ordini.
 */
class OrdineController {
	/**
	 * Aggiunge un nuovo ordine.
	 *
	 * @param req Richiesta autenticata con `ref_prenotazione`, `username_ordinante`
	 * @param res Risposta con conferma e ID ordine, o errore
	 */
	static async addOrdine(req: AuthenticatedRequest, res: Response): Promise<void> {
		try {
			const { ref_prenotazione, username_ordinante } = req.body;
			const ref_cliente = req.user?.id ? Number(req.user.id) : null;

			const ordineInput: OrdineInput = { ref_prenotazione, username_ordinante, ref_cliente };
			const ordine = await OrdineService.creaOrdine(ordineInput);

			if (ordine) {
				res.status(201).json({
					success: true,
					data: {
						body: req.body,
						id_ordine: ordine,
					},
				});
			} else {
				res.status(400).json({
					success: false,
					message: "Errore durante l'aggiunta dell'ordine",
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
	 * Aggiunge i dati di pagamento a un ordine.
	 *
	 * @param req Richiesta contenente `pagamento_importo`, `data_ora_pagamento`, `id_ordine`
	 * @param res Risposta con conferma o errore
	 */
	static async addPagamento(req: Request, res: Response): Promise<void> {
		try {
			await OrdineService.aggiungiPagamento(
				req.body.pagamento_importo,
				req.body.data_ora_pagamento,
				req.body.id_ordine
			);
			res.json({ success: true, message: 'Pagamento aggiunto con successo' });
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
	 * Restituisce l'ID dell'ordine dato `id_prenotazione` e `username`.
	 *
	 * @param req Parametri: `id_prenotazione`, `username`
	 * @param res Risposta con ID ordine o messaggio di errore
	 */
	static async getOrdineByPrenotazioneAndUsername(req: Request, res: Response): Promise<void> {
		try {
			const idPrenotazione: number = Number(req.params.id_prenotazione);
			const username = req.params.username;

			const idOrdine = await OrdineService.getOrdineByPrenotazioneAndUsername(
				idPrenotazione,
				username
			);

			if (idOrdine) {
				res.status(201).json({
					success: true,
					data: idOrdine,
				});
			} else {
				res.status(400).json({
					success: false,
					message: 'Ordine non trovato',
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
	 * Calcola l'importo totale di un ordine (senza modificarne lo stato).
	 *
	 * @param req Parametri contenenti `idOrdine`
	 * @param res Risposta con totale calcolato o errore
	 */
	static async calcolaImportoTotale(req: Request, res: Response): Promise<void> {
		const ordineId = Number(req.params.idOrdine);

		try {
			const totale = await OrdineService.calcolaImportoTotale(ordineId, false);

			res.json({
				success: true,
				totale: totale,
			});
		} catch (error) {
			console.error('❌ [Controller] Errore durante il calcolo del totale:', error);
			res.status(500).json({
				success: false,
				message: `Errore durante il calcolo del totale: ${error}`,
			});
		}
	}
}

export default OrdineController;