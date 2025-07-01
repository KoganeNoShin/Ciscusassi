import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../Middleware/authMiddleware';
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
            await PrenotazioneService.eliminaPrenotazione(parseInt(req.params.id_prenotazione));

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
            const otp = await PrenotazioneService.getOTPById(parseInt(req.params.id_prenotazione));

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
            const prenotazione = await PrenotazioneService.getPrenotazioneById(parseInt(req.params.id_prenotazione));

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

    static async getPrenotazioniByCliente(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const prenotazioni = await PrenotazioneService.getPrenotazioniByCliente(Number(req.user?.id));

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

    static async getPrenotazioniDelGiornoFiliale(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { data } = req.query;
            let dataFormattata: string;
            // Se non è presente, usiamo la data corrente
            if (!data) {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                dataFormattata = `${year}-${month}-${day}`;
            } else {
                dataFormattata = data as string;
            }

            // Recupera le prenotazioni per la filiale e la data
            const id_Filiale = Number(req.user?.ref_filiale); 
            const prenotazioni = await PrenotazioneService.getPrenotazioniDataAndFiliale(id_Filiale, dataFormattata);

            if (prenotazioni && prenotazioni.length > 0) {
                res.json({ success: true, data: prenotazioni });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Nessuna prenotazione trovata per la data specificata'
                });
            }
        } catch (err) {
            console.error('❌ Errore durante il recupero delle prenotazioni del giorno:', err);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: (err instanceof Error ? err.message : String(err))
            });
        }
    }


	static async getTavoliInUso(req: Request, res: Response) {
		try {
            const { data } = req.query;
            let dataFormattata: string;
            // Se non è presente, usiamo la data corrente
            if (!data) {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                dataFormattata = `${year}-${month}-${day} ${hours}:${minutes}`;
            } else {
                dataFormattata = data as string;
            }


			const tavoli = await PrenotazioneService.calcolaTavoliInUso(parseInt(req.params.id_filiale), dataFormattata);
			res.status(200).json(tavoli);
		} catch (error) {
			console.error('❌ Errore durante il calcolo dei tavoli:', error);
			res.status(500).json({ message: 'Errore durante il calcolo dei tavoli in uso' });
		}
	}

    static async getStatoPrenotazioneCameriere(req: Request, res: Response): Promise<void> {
        try {
            const id_prenotazione = parseInt(req.params.id_prenotazione);
            const stato = await PrenotazioneService.getStatoPrenotazioneCameriere(id_prenotazione);

            res.json({ success: true, data: stato });
        } catch (err) {
            console.error('❌ Errore in getStatoPrenotazione:', err);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: (err instanceof Error ? err.message : String(err))
            });
        }
    }

    static async getStatoPrenotazioneChef(req: Request, res: Response): Promise<void> {
        try {
            const id_prenotazione = parseInt(req.params.id_prenotazione);
            const stato = await PrenotazioneService.getStatoPrenotazioneChef(id_prenotazione);

            res.json({ success: true, data: stato });
        } catch (err) {
            console.error('❌ Errore in getStatoPrenotazione:', err);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: (err instanceof Error ? err.message : String(err))
            });
        }
    }

    static async checkOTP(req: Request, res: Response): Promise<void> {
    try {
        const { data_ora_prenotazione, ref_torretta, otp } = req.body;
        const isValid = await PrenotazioneService.checkOTP(data_ora_prenotazione, ref_torretta, otp);

        res.json({ success: true, data: isValid });
    } catch (err) {
        console.error('❌ Errore in checkOTP:', err);
        res.status(500).json({
            success: false,
            message: 'Errore interno del server',
            error: (err instanceof Error ? err.message : String(err))
        });
    }
}

}

export default PrenotazioneController;