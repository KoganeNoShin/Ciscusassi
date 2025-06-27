import { Request, Response, NextFunction } from 'express';
import Cliente from '../Models/cliente';
import Impiegato from '../Models/impiegato';
import AuthService from '../Services/authService';

export interface AuthenticatedRequest extends Request {
	user?: {
		id: number | string;
		ruolo: 'cliente' | 'chef' | 'amministratore' | 'cameriere';
		[key: string]: any;
	};
}

const authMiddleware = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({ message: 'Token mancante o non valido' });
		return;
	}

	const token = authHeader.split(' ')[1];
	var expiredToken = false;

	try {
		AuthService.verifyToken(token);
	} catch (err) {
		expiredToken = true;
	}

	Cliente.findByToken(token)
		.then((cliente) => {
			if (cliente) {
				req.user = {
					...cliente,
					id: cliente.numero_carta,
					ruolo: 'cliente',
				};

				if (expiredToken) {
					Cliente.invalidateToken(cliente.numero_carta);
					res.status(401).json({
						success: false,
						message: 'Il token è scaduto!',
					});

					return;
				}

				next();
			} else {
				// Non cliente, cerco impiegato
				return Impiegato.getByToken(token).then((impiegato) => {
					if (impiegato) {
						req.user = {
							...impiegato,
							id: impiegato.matricola,
							ruolo: impiegato.ruolo.toLowerCase() as
								| 'cliente'
								| 'chef'
								| 'amministratore'
								| 'cameriere',
						};
						console.log('Utente caricato:', req.user);

						if (expiredToken) {
							Impiegato.invalidateToken(impiegato.matricola);
							res.status(401).json({
								success: false,
								message: 'Il token è scaduto!',
							});

							return;
						}

						next();
					} else {
						res.status(401).json({
							success: false,
							message: 'Token non valido',
						});
					}
				});
			}
		})
		.catch((err) => {
			console.error('Errore authMiddleware:', err);
			res.status(500).json({
				success: false,
				message: 'Errore del server ' + err,
			});
		});
};

export default authMiddleware;
