import AuthService from '../Services/authService';
import { Request, Response } from 'express';

/**
 * Controller per la gestione dell'autenticazione (login, logout, recupero password).
 */
class AuthController {
	/**
	 * Effettua il login di un cliente o impiegato.
	 * 
	 * @param req Richiesta HTTP contenente `email` e `password` nel body
	 * @param res Risposta HTTP
	 * 
	 * @returns 200 con token e dati utente se successo,
	 *          401 se email o password non valide,
	 *          400 in caso di errore durante il login.
	 */
	static async login(req: Request, res: Response): Promise<void> {
		try {
			const logged = await AuthService.login(req.body);

			if (logged) {
				res.status(200).json({
					success: true,
					data: logged,
				});
				return;
			}

			res.status(401).json({
				success: false,
				message: 'Email o password errata!',
			});
		} catch (error: any) {
			console.error('❌ [AUTH ERROR] login:', error.message);
			res.status(400).json({
				success: false,
				message: 'Errore durante il login: ' + error.message,
			});
		}
	}

	/**
	 * Effettua il logout dell'utente e invalida il token.
	 * 
	 * @param req Richiesta HTTP contenente il token nell’header Authorization
	 * @param res Risposta HTTP
	 * 
	 * @returns 200 se logout riuscito,
	 *          401 se token assente o non valido,
	 *          500 in caso di errore interno.
	 */
	static async logout(req: Request, res: Response): Promise<void> {
		try {
			const token = req.headers.authorization?.replace('Bearer ', '');

			if (!token) {
				res.status(401).json({
					success: false,
					message: 'Non autenticato',
				});
				return;
			}

			const loggedOut = await AuthService.logout(token);

			if (loggedOut) {
				res.status(200).json({
					success: true,
					message: 'Logout effettuato',
				});
			} else {
				res.status(401).json({
					success: false,
					message: 'Token non valido o utente non trovato!',
				});
			}
		} catch (error: any) {
			console.error('❌ [AUTH ERROR] logout:', error.message);
			res.status(500).json({
				success: false,
				message: 'Errore durante il logout: ' + error.message,
			});
		}
	}

	/**
	 * Invia una email di recupero password all’indirizzo fornito.
	 * 
	 * @param req Richiesta HTTP contenente `email` nel body
	 * @param res Risposta HTTP
	 * 
	 * @returns 200 se email inviata con successo,
	 *          500 in caso di errore durante l’invio.
	 */
	static async recuperaPassword(req: Request, res: Response): Promise<void> {
		try {
			const emailCliente = req.body.email;

			await AuthService.recuperaPassword(emailCliente);

			res.status(200).json({
				success: true,
				message: 'Email recupera Password con successo',
			});
		} catch (err) {
			console.error('❌ [CLIENTE ERROR] recuperaPassword:', err);
			res.status(500).json({
				success: false,
				message: String((err as Error).message),
			});
		}
	}
}

export default AuthController;