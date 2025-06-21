import { Request, Response } from 'express';
import PrenotazioneService from '../Services/prenotazioneService';

class PrenotazioneController {
    static async prenota(req: Request, res: Response): Promise<void> {
        try {
            const prenotazione = await PrenotazioneService.prenota(req.body);

            if(prenotazione) res.status(201).json({ success: true, data: req.body });
           else res.status(400).json({
                    success: false,
					message: 'Errore durante l\'aggiunta della prenotazione',
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