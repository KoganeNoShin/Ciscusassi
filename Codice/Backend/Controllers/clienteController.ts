import Cliente, { ClienteData } from '../Models/cliente';
import AuthService from '../Services/authService';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../Middleware/authMiddleware';
import ClienteService from '../Services/clienteService';

/**
 * Controller per la gestione delle operazioni lato cliente.
 */
class ClienteController {
	/**
	 * Registra un nuovo cliente nel sistema.
	 * 
	 * @param req Richiesta contenente i dati del cliente (nome, cognome, data_nascita, email, immagine e password)
	 * @param res Risposta HTTP
	 * 
	 * @returns 200 con messaggio e dati cliente se successo,
	 *          400 in caso di errore di registrazione
	 */
	static async register(req: Request, res: Response): Promise<void> {
		try {
			const { nome, cognome, data_nascita, image, email, nuovaPassword } =
				req.body;
			const data: ClienteData = {
				nome,
				cognome,
				data_nascita,
				image,
				email,
				password: nuovaPassword,
			};
			const result = await ClienteService.register(data);

			res.status(200).json({
				success: true,
				message: 'Cliente registrato con successo',
				data: result,
			});
		} catch (error: any) {
			console.error('❌ [CLIENTE ERROR] register:', error.message);
			res.status(400).json({
				success: false,
				message: 'Errore durante la registrazione: ' + error.message,
			});
		}
	}

	/**
	 * Restituisce i punti accumulati dal cliente autenticato.
	 * 
	 * @param req Richiesta autenticata contenente l'id dell'utente
	 * @param res Risposta HTTP
	 * 
	 * @returns 200 con numero di punti,
	 *          500 in caso di errore
	 */
	static async getPuntiCliente(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const idCliente = Number(req.user?.id);

			const punti = await ClienteService.getPuntiCliente(idCliente);

			res.status(200).json({
				success: true,
				data: punti,
			});
		} catch (err) {
			console.error('❌ [CLIENTE ERROR] getPuntiCliente:', err);
			res.status(500).json({
				success: false,
				message: 'Errore durante il recupero dei punti',
			});
		}
	}

	/**
	 * Aggiorna i dati personali del cliente autenticato.
	 * 
	 * @param req Richiesta autenticata contenente i nuovi dati personali
	 * @param res Risposta HTTP
	 * 
	 * @returns 200 se aggiornamento riuscito,
	 *          400 se errore nei dati o nella richiesta
	 */
	static async aggiornaDatiPersonali(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const idCliente = Number(req.user?.id);

			await ClienteService.aggiornaDatiPersonali(idCliente, req.body);

			res.status(200).json({
				success: true,
				message: 'Dati personali aggiornati con successo',
			});
		} catch (err) {
			console.error('❌ [CLIENTE ERROR] aggiornaDatiPersonali:', err);
			res.status(400).json({
				success: false,
				message: String((err as Error).message),
			});
		}
	}

	/**
	 * Aggiorna la password del cliente autenticato.
	 * 
	 * @param req Richiesta autenticata contenente la nuova password
	 * @param res Risposta HTTP
	 * 
	 * @returns 200 se aggiornamento riuscito,
	 *          500 in caso di errore interno
	 */
	static async aggiornaPassword(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const idCliente = Number(req.user?.id);

			await ClienteService.aggiornaPassword(
				idCliente,
				req.body.nuovaPassword
			);

			res.status(200).json({
				success: true,
				message: 'Password aggiornata con successo',
			});
		} catch (err) {
			console.error('❌ [CLIENTE ERROR] aggiornaPassword:', err);
			res.status(500).json({
				success: false,
				message: String((err as Error).message),
			});
		}
	}

	/**
	 * Aggiorna l'email del cliente autenticato.
	 * 
	 * @param req Richiesta autenticata contenente la nuova email
	 * @param res Risposta HTTP
	 * 
	 * @returns 200 se aggiornamento riuscito,
	 *          500 in caso di errore interno
	 */
	static async aggiornaEmail(
		req: AuthenticatedRequest,
		res: Response
	): Promise<void> {
		try {
			const idCliente = Number(req.user?.id);

			console.log(`Sto cambiando email con ${req.body.nuovaEmail}`);
			await ClienteService.aggiornaEmail(idCliente, req.body.nuovaEmail);

			res.status(200).json({
				success: true,
				message: 'Email aggiornata con successo',
			});
		} catch (err) {
			console.error('❌ [CLIENTE ERROR] aggiornaEmail:', err);
			res.status(500).json({
				success: false,
				message: String((err as Error).message),
			});
		}
	}
}

export default ClienteController;