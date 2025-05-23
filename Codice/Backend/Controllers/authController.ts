import AuthService from '../Services/authService';

import { Request, Response } from 'express';

import Cliente from '../Models/cliente';
import Impiegato from '../Models/impiegato';

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
			// Tipizza req come AuthenticatedRequest per accedere a req.user
			const user = (req as any).user;

			if (!user) {
				res.status(401).json({
					success: false,
					message: 'Non autenticato',
				});
				return;
			}

			if (user.ruolo === 'cliente') {
				await Cliente.invalidateToken(user.numero_carta); // o user.id
			} else {
				await Impiegato.invalidateToken(user.matricola); // o user.id
			}

			res.status(200).json({
				success: true,
				message: 'Logout effettuato',
			});
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
