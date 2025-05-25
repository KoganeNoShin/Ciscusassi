import AuthService from '../Services/authService';

import { Request, Response } from 'express';

class AuthController {
	static async login(req: Request, res: Response): Promise<void> {
		try {
			const logged = await AuthService.login(req.body);

			if (logged) {
				res.status(200).json({
					success: true,
					data: logged,
				});
			} else {
				res.status(401).json({
					success: false,
					message: 'Email o password errata!',
				});
			}
		} catch (error: any) {
			res.status(400).json({
				success: false,
				message: 'Errore durante il login: ' + error.message,
			});
		}
	}

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
					success: true,
					message: 'Token non valido o utente non trovato!',
				});
			}
		} catch (error) {
			console.error('Errore logout:', error);
			res.status(500).json({
				success: false,
				message: 'Errore durante il logout',
			});
		}
	}
}

export default AuthController;
