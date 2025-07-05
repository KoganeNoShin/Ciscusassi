import { Response } from 'express';
import { AuthenticatedRequest } from '../Middleware/authMiddleware';
import AsportoService, { AsportoData } from '../Services/asportoService';

/**
 * Controller per la gestione delle operazioni relative agli ordini d'asporto.
 */
class AsportoController {
	/**
	 * Crea un nuovo ordine d'asporto associato al cliente autenticato.
	 * 
	 * @param req Richiesta autenticata contenente i dati dell'asporto nel body
	 * @param res Risposta HTTP
	 * 
	 * Body richiesto:
	 * - data_ora_consegna: stringa data/ora nel formato accettato dal DB
	 * - data_ora_pagamento: stringa data/ora del pagamento (può coincidere con la consegna)
	 * - importo: numero (prezzo totale)
	 * - indirizzo: stringa con l’indirizzo di consegna
	 * - prodotti: array di prodotti richiesti (input per `OrdProd`)
	 * - ref_filiale: ID numerico della filiale
	 * 
	 * La richiesta deve essere autenticata, il `ref_cliente` è preso da `req.user.id`.
	 * 
	 * @returns 201 con `success: true` se l'operazione va a buon fine, 
	 *          400 se l’inserimento fallisce, 
	 *          500 in caso di errore interno del server
	 */
	static async addAsporto(req: AuthenticatedRequest, res: Response): Promise<void> {
		try {
			const {
				data_ora_consegna,
				data_ora_pagamento,
				importo,
				indirizzo,
				prodotti,
				ref_filiale
			} = req.body;

			const data: AsportoData = {
				data_ora_consegna,
				data_ora_pagamento,
				importo,
				indirizzo,
				prodotti,
				ref_filiale,
				ref_cliente: Number(req.user?.id) // ID cliente autenticato
			};

			const result = await AsportoService.addAsporto(data);

			if (result)
				res.status(201).json({ success: true, data: req.body });
			else
				res.status(400).json({
					success: false,
					message: 'Errore durante l\'aggiunta dell\'asporto',
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

export default AsportoController;