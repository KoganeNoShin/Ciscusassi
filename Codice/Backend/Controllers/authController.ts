import AuthService from '../Services/authService';
import { Request, Response } from 'express';

class AuthController {
	// Gestisce il login per cliente o impiegato
	static async login(req: Request, res: Response): Promise<void> {
		try {
			const logged = await AuthService.login(req.body);

			if (logged) {
				res.status(200).json({
					success: true,
					data: logged
				});
				return;
			}

			res.status(401).json({
				success: false,
				message: 'Email o password errata!'
			});
		} catch (error: any) {
			console.error('❌ [AUTH ERROR] login:', error.message);
			res.status(400).json({
				success: false,
				message: 'Errore durante il login: ' + error.message
			});
		}
	}

	// Gestisce il logout e l'invalidazione del token
	static async logout(req: Request, res: Response): Promise<void> {
		try {
			const token = req.headers.authorization?.replace('Bearer ', '');

			if (!token) {
				res.status(401).json({
					success: false,
					message: 'Non autenticato'
				});
				return;
			}

			const loggedOut = await AuthService.logout(token);

			if (loggedOut) {
				res.status(200).json({
					success: true,
					message: 'Logout effettuato'
				});
			} else {
				res.status(401).json({
					success: false,
					message: 'Token non valido o utente non trovato!'
				});
			}
		} catch (error: any) {
			console.error('❌ [AUTH ERROR] logout:', error.message);
			res.status(500).json({
				success: false,
				message: 'Errore durante il logout: ' + error.message
			});
		}
	}

	// Recupera Password
	static async recuperaPassword(req: Request, res: Response): Promise<void> {
		try {
			const emailCliente = req.body.email;

			await AuthService.recuperaPassword(emailCliente);

			res.status(200).json({
				success: true,
				message: 'Email recupera Password con successo'
			});
		} catch (err) {
			console.error('❌ [CLIENTE ERROR] recuperaPassword:', err);
			res.status(500).json({ success: false, message: String((err as Error).message) });
		}
	}
}

export default AuthController;