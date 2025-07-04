import { Request, Response } from 'express';
import ImpiegatoService from '../Services/impiegatoService';

class ImpiegatoController {
	static async addImpiegato(req: Request, res: Response): Promise<void> {
		try {
			const {nome, cognome, ruolo, foto, email, data_nascita, ref_filiale} = req.body;

			const id = await ImpiegatoService.addImpiegato(nome, cognome, ruolo, foto, email, data_nascita, ref_filiale);
			res.status(201).json({ success: true, data: id });
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
				error: (err instanceof Error ? err.message : String(err))
			});
		}
	}

	static async updateImpiegato(req: Request, res: Response): Promise<void> {
		try {
			await ImpiegatoService.updateImpiegato(req.body, parseInt(req.params.matricola));
			res.json({ success: true, message: 'Impiegato aggiornato con successo' });
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
				error: (err instanceof Error ? err.message : String(err))
			});
		}
	}

	static async deleteImpiegato(req: Request, res: Response): Promise<void> {
		try {
			await ImpiegatoService.deleteImpiegato(parseInt(req.params.matricola));
			res.json({ success: true, message: 'Impiegato eliminato con successo' });
		} catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
				error: (err instanceof Error ? err.message : String(err))
			});
		}
	}

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
				res.status(404).json({
					success: false,
					message: 'Nessun impiegato trovato per la filiale specificata',
				});
			}
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

export default ImpiegatoController;
