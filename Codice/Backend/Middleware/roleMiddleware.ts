import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

const roleMiddleware = (allowedRoles: string[]) => {
	return (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction
	): void => {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: 'Non autenticato',
			});
			return;
		}

		const ruolo = req.user.ruolo;

		if (ruolo === 'cliente') {
			res.status(403).json({
				success: false,
				message: 'Accesso negato per i clienti',
			});
			return;
		}

		if (!allowedRoles.includes(ruolo)) {
			res.status(403).json({
				success: false,
				message: `Ruolo non autorizzato: ${ruolo}`,
			});
			return;
		}

		next();
	};
};

export default roleMiddleware;
