import { Request, Response } from 'express';
import OrdProdService from '../Services/ordprodService';

/**
 * Controller per la gestione della tabella OrdProd (prodotti associati agli ordini).
 */
class OrdProdController {
	/**
	 * Aggiunge prodotti a un ordine.
	 *
	 * @param req Corpo contenente la lista dei prodotti per uno o più ordini
	 * @param res Risposta con gli ID inseriti o errore
	 */
	static async addProdottiOrdine(req: Request, res: Response): Promise<void> {
		const ordini = req.body;
		try {
			const idsInseriti = await OrdProdService.creaOrdiniProdotto(ordini);
			res.status(201).json({
				success: true,
				message: 'Ordini prodotti creati con successo',
				ids: idsInseriti,
			});
		} catch (err) {
			console.error('❌ Errore nel controller:', err);
			res.status(500).json({ success: false, message: 'Errore interno del server' });
		}
	}

	/**
	 * Ottiene i prodotti associati a un ordine.
	 *
	 * @param req Parametro `id_ordine`
	 * @param res Risposta con la lista dei prodotti o errore
	 */
	static async getProdottiByOrdine(req: Request, res: Response): Promise<void> {
		try {
			const ordineId = Number(req.params.id_ordine);

			const prodotti = await OrdProdService.getProdottiByOrdine(ordineId);
			if (prodotti) {
				res.status(200).json({ success: true, data: prodotti });
			} else {
				res.status(404).json({
					success: false,
					message: 'Nessun prodotto trovato per questo ordine',
				});
			}
		} catch (error) {
			console.error(
				'❌ [OrdProdController] Errore durante il recupero dei prodotti dell\'ordine:',
				error
			);
			res.status(500).json({ success: false, message: 'Errore interno del server' });
		}
	}

	/**
	 * Ottiene tutti i prodotti collegati a una prenotazione (raggruppando più ordini).
	 *
	 * @param req Parametro `id_prenotazione`
	 * @param res Risposta con lista dei prodotti o errore
	 */
	static async getProdottiByPrenotazione(req: Request, res: Response): Promise<void> {
		try {
			const prenotazioneId = Number(req.params.id_prenotazione);

			const prodotti = await OrdProdService.getProdottiByPrenotazione(prenotazioneId);

			if (!prodotti || prodotti.length === 0) {
				res.status(404).json({ message: 'Nessun prodotto trovato per la prenotazione' });
				return;
			}

			res.status(200).json(prodotti);
		} catch (error) {
			console.error('[OrdProdController] Errore nel recupero dei prodotti:', error);
			res.status(500).json({ error: 'Errore interno del server' });
		}
	}

	/**
	 * Aggiorna lo stato di un singolo prodotto dell'ordine (es. da "PREPARAZIONE" a "IN CONSEGNA").
	 *
	 * @param req Parametro `id_ordprod`, corpo con `stato`
	 * @param res Risposta di conferma o errore
	 */
	static async cambiaStatoProdottoOrdine(req: Request, res: Response): Promise<void> {
		try {
			const idProdotto = Number(req.params.id_ordprod);
			const nuovoStato = req.body.stato;

			await OrdProdService.cambiaStatoProdottoOrdine(idProdotto, nuovoStato);
			res.status(200).json({
				success: true,
				message: 'Stato del prodotto aggiornato con successo',
			});
		} catch (error) {
			console.error(
				'❌ [OrdProdController] Errore durante il cambio di stato del prodotto dell\'ordine:',
				error
			);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
			});
		}
	}

	/**
	 * Imposta il flag `is_romana` di un prodotto d’ordine.
	 *
	 * @param req Parametro `id_ordprod`, corpo con `isRomana` booleano
	 * @param res Risposta di conferma o errore
	 */
	static async aggiornaStatoRomana(req: Request, res: Response): Promise<void> {
		const idOrdProd = Number(req.params.id_ordprod);
		const { isRomana } = req.body;

		try {
			await OrdProdService.aggiornaStatoRomana(idOrdProd, isRomana);
			res.json({
				success: true,
				message: 'Stato is_romana aggiornato con successo',
			});
		} catch (error) {
			console.error(
				'❌ [Controller] Errore durante l\'aggiornamento dello stato:',
				error
			);
			res.status(500).json({
				success: false,
				message: `Errore durante l'aggiornamento dello stato: ${error}`,
			});
		}
	}
}

export default OrdProdController;