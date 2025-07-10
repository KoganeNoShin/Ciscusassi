import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../Middleware/authMiddleware';
import PrenotazioneService, { PrenotazioneRequest } from '../Services/prenotazioneService';

/**
 * Controller per la gestione delle prenotazioni.
 */
class PrenotazioneController {
    /**
	 * Crea una prenotazione per un cliente autenticato.
	 * @param req Richiesta HTTP contenente i dati della prenotazione
	 * @param res Risposta HTTP
	 * @returns 201 con prenotazione creata, 400 se errore, 500 se errore server
	 */
    static async prenota(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const {ref_filiale, data_ora_prenotazione, numero_persone} = req.body
            const ref_cliente = Number(req.user?.id);

            const prenotazioneInput: PrenotazioneRequest = {
                ref_filiale,
                data_ora_prenotazione,
                numero_persone,
                ref_cliente
            }
            const prenotazione = await PrenotazioneService.prenota(prenotazioneInput);

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

    /**
	 * Crea una prenotazione in loco da parte di un operatore.
	 * @param req Richiesta HTTP con corpo contenente dati prenotazione e cliente
	 * @param res Risposta HTTP
	 * @returns 201 se prenotazione creata, 400 o 500 se errore
	 */
    static async prenotaLoco(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const {ref_cliente, data_ora_prenotazione, numero_persone} = req.body
            const ref_filiale = Number(req.user?.id_filiale);

            const prenotazioneInput: PrenotazioneRequest = {
                ref_filiale,
                data_ora_prenotazione,
                numero_persone,
                ref_cliente
            }
            const prenotazione = await PrenotazioneService.prenotaLoco(prenotazioneInput);

            if(prenotazione) res.status(201).json({ success: true, data: prenotazione });
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

    /**
	 * Conferma una prenotazione esistente.
	 * @param req Richiesta contenente l'ID della prenotazione
	 * @param res Risposta HTTP
	 * @returns 200 se confermata, 500 se errore
	 */
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

    /**
	 * Modifica una prenotazione esistente.
	 * @param req Richiesta contenente id_prenotazione, numero_persone, data_ora
	 * @param res Risposta HTTP
	 * @returns 200 con dati aggiornati, 500 se errore
	 */
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

    /**
	 * Elimina una prenotazione tramite ID.
	 * @param req Richiesta con parametro id_prenotazione
	 * @param res Risposta HTTP
	 * @returns 200 se eliminata, 500 se errore
	 */
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

    /**
	 * Restituisce l'OTP della prenotazione tramite ID torretta e orario.
	 * @param req Parametri URL con id_prenotazione
	 * @param res Risposta HTTP
	 * @returns 200 con OTP, 500 se errore
	 */
    static async getOTPByIdTorrettaAndData(req: Request, res: Response): Promise<void> {
        try {
            const otp = await PrenotazioneService.getOTPByIdTorrettaAndData(Number(req.params.id_torretta));

            res.json({ success: true, otp });       
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
	 * Ottiene i dati di una prenotazione tramite ID.
	 * @param req Parametri URL con id_prenotazione
	 * @param res Risposta HTTP
	 * @returns 200 con dati, 500 se errore
	 */
    static async getPrenotazioneById(req: Request, res: Response): Promise<void> {
        try {
            const prenotazione = await PrenotazioneService.getPrenotazioneById(parseInt(req.params.id_prenotazione));

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

    /**
	 * Restituisce tutte le prenotazioni del sistema.
	 * @param req Richiesta HTTP
	 * @param res Risposta HTTP
	 * @returns 200 con lista prenotazioni o 500 se errore
	 */
    static async getAllPrenotazioni(req: Request, res: Response): Promise<void> {
        try {
            const prenotazioni = await PrenotazioneService.getAllPrenotazioni();

            res.json({ success: true, data: prenotazioni });
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
	 * Ottiene tutte le prenotazioni associate all'utente autenticato.
	 * @param req Richiesta autenticata con ID cliente
	 * @param res Risposta HTTP
	 * @returns 200 con prenotazioni, 500 se errore
	 */
    static async getPrenotazioniByCliente(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const prenotazioni = await PrenotazioneService.getPrenotazioniByCliente(Number(req.user?.id));

            res.json({ success: true, data: prenotazioni });
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
	 * Recupera le prenotazioni di un cliente specifico (per cameriere).
	 * @param req Parametri URL con id_cliente
	 * @param res Risposta HTTP
	 * @returns 200 con dati o 500 in caso di errore
	 */
    static async getPrenotazioniCameriereByCliente(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const prenotazioni = await PrenotazioneService.getPrenotazioniByCliente(Number(req.params.id_cliente));

            res.json({ success: true, data: prenotazioni });
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
	 * Ottiene le prenotazioni giornaliere per la filiale dell'utente.
	 * @param req Richiesta con data in query string (opzionale)
	 * @param res Risposta HTTP
	 * @returns 200 con lista, 500 se errore
	 */
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
            const id_Filiale = Number(req.user?.id_filiale); 
            const prenotazioni = await PrenotazioneService.getPrenotazioniDataAndFiliale(id_Filiale, dataFormattata);

            res.json({ success: true, data: prenotazioni });;
        } catch (err) {
            console.error('❌ Errore durante il recupero delle prenotazioni del giorno:', err);
            res.status(500).json({
                success: false,
                message: 'Errore interno del server',
                error: (err instanceof Error ? err.message : String(err))
            });
        }
    }

    /**
	 * Calcola il numero di tavoli in uso in una data e ora per la filiale.
	 * @param req Query param opzionale 'data', altrimenti usa data corrente
	 * @param res Risposta HTTP
	 * @returns 200 con numero tavoli, 500 se errore
	 */
	static async getTavoliInUso(req: AuthenticatedRequest, res: Response) {
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

            const id_Filiale = Number(req.user?.id_filiale); 
			const tavoli = await PrenotazioneService.calcolaTavoliInUso(id_Filiale, dataFormattata);
			res.status(200).json(tavoli);
		} catch (error) {
			console.error('❌ Errore durante il calcolo dei tavoli:', error);
			res.status(500).json({ message: 'Errore durante il calcolo dei tavoli in uso' });
		}
	}

    /**
	 * Ottiene lo stato di una prenotazione per il cameriere.
	 * @param req Parametri URL con id_prenotazione
	 * @param res Risposta HTTP
	 * @returns 200 con stato, 500 se errore
	 */
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

    /**
	 * Ottiene lo stato di una prenotazione per lo chef.
	 * @param req Parametri URL con id_prenotazione
	 * @param res Risposta HTTP
	 * @returns 200 con stato, 500 se errore
	 */
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

    /**
	 * Verifica la validità di un codice OTP per una determinata torretta e data.
	 * @param req Corpo richiesta contenente data_ora_prenotazione, ref_torretta e otp
	 * @param res Risposta HTTP
	 * @returns 200 con booleano, 500 se errore
	 */
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