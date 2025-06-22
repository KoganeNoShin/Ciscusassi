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

    static async prenotaLoco(req: Request, res: Response): Promise<void> {
        try {
            const prenotazione = await PrenotazioneService.prenotaLoco(req.body);

            if(prenotazione) res.status(201).json({ success: true, data: req.body });
           else res.status(400).json({
                    success: false,
					message: 'Errore durante l\'aggiunta della prenotazione locale',
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

    static async confermaPrenotazione(req: Request, res: Response): Promise<void> {
        try {
            const id_prenotazione = parseInt(req.body.id_prenotazione);
            await PrenotazioneService.confermaPrenotazione(id_prenotazione);

            res.json({
                success: true,
                message: 'Prenotazione confermata con successo'
            });
        } catch (err) {
            console.error('❌ Errore in confermaPrenotazione:', err);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }


    static async modificaPrenotazione(req: Request, res: Response): Promise<void> {
        try {
            const id_prenotazione = parseInt(req.body.id_prenotazione);
            const numero_persone = req.body.numero_persone;
            const data_ora_prenotazione = req.body.data_ora_prenotazione;
            const prenotazione = await PrenotazioneService.modificaPrenotazione(id_prenotazione, numero_persone, data_ora_prenotazione);

            res.json({ success: true, data: prenotazione });
        } catch (err) {
			console.error(err);
			res.status(500).json({
				success: false,
				message: 'Errore interno del server',
				error: (err instanceof Error ? err.message : String(err))
			});
		}
    }

    static async eliminaPrenotazione(req: Request, res: Response): Promise<void> {
        try {
            await PrenotazioneService.eliminaPrenotazione(parseInt(req.params.id));

            res.json({ success: true, message: 'Prenotazione eliminata con successo' });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: (err instanceof Error ? err.message : String(err))
            });
        }
    }

    static async getOTPById(req: Request, res: Response): Promise<void> {
        try {
            const otp = await PrenotazioneService.getOTPById(parseInt(req.params.id));

            if (otp) res.json({ success: true, data: otp });
            else res.status(404).json({
                success: false,
                message: 'Prenotazione non trovata o OTP non disponibile',
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

    static async getPrenotazioneById(req: Request, res: Response): Promise<void> {
        try {
            const prenotazione = await PrenotazioneService.getPrenotazioneById(parseInt(req.params.id));

            if (prenotazione) res.json({ success: true, data: prenotazione });
            else res.status(404).json({
                success: false,
                message: 'Prenotazione non trovata',
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

    static async getAllPrenotazioni(req: Request, res: Response): Promise<void> {
        try {
            const prenotazioni = await PrenotazioneService.getAllPrenotazioni();

            if (prenotazioni) res.json({ success: true, data: prenotazioni });
            else res.status(404).json({
                success: false,
                message: 'Nessuna prenotazione trovata',
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

    static async getPrenotazioniByCliente(req: Request, res: Response): Promise<void> {
        try {
            const prenotazioni = await PrenotazioneService.getPrenotazioniByCliente(parseInt(req.params.clienteId));

            if (prenotazioni) res.json({ success: true, data: prenotazioni });
            else res.status(404).json({
                success: false,
                message: 'Nessuna prenotazione trovata per questo cliente',
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

    static async getPrenotazioniDelGiornoFiliale(req: Request, res: Response): Promise<void> {
        try {
            const prenotazioni = await PrenotazioneService.getPrenotazioniDelGiornoFiliale(parseInt(req.params.filiale));

            if (prenotazioni) res.json({ success: true, data: prenotazioni });
            else res.status(404).json({
                success: false,
                message: 'Nessuna prenotazione trovata per la data di oggi',
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

	static async getTavoliInUso(req: Request, res: Response) {
		try {
			const tavoli = await PrenotazioneService.calcolaTavoliInUso();
			res.status(200).json(tavoli);
		} catch (error) {
			console.error('❌ Errore durante il calcolo dei tavoli:', error);
			res.status(500).json({ message: 'Errore durante il calcolo dei tavoli in uso' });
		}
	}
}

export default PrenotazioneController;