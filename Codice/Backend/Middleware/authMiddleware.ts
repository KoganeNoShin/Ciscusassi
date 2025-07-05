import { Request, Response, NextFunction } from 'express';
import Cliente from '../Models/cliente';
import Impiegato from '../Models/impiegato';
import AuthService from '../Services/authService';

/**
 * Estende l'interfaccia Request per includere l'utente autenticato.
 */
export interface AuthenticatedRequest extends Request {
	user?: {
		id: number | string;
		ruolo: 'cliente' | 'chef' | 'amministratore' | 'cameriere';
		id_filiale?: number;
		[key: string]: any;
	};
}

/**
 * Middleware di autenticazione.
 * Verifica la presenza e la validità del token JWT nell'header `Authorization`.
 * Se il token è valido e corrisponde a un cliente o impiegato registrato, 
 * aggiunge i dati utente all'oggetto `req.user` e passa il controllo al middleware successivo.
 * In caso di token mancante, non valido o scaduto, restituisce errore 401.
 *
 * @param req Richiesta HTTP estesa con campo `user`
 * @param res Risposta HTTP
 * @param next Funzione per passare al middleware successivo
 * @returns 401 in caso di token mancante, scaduto o non valido; 500 in caso di errore interno
 */
const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({ success: false, message: 'Token mancante o non valido' });
		return;
	}

	const token = authHeader.split(' ')[1];
	let expiredToken = false;

	try {
		AuthService.verifyToken(token);
	} catch (err) {
		expiredToken = true;
	}

	try {
		const cliente = await Cliente.getByToken(token);

		if (cliente) {
			req.user = {
				...cliente,
				id: cliente.numero_carta,
				ruolo: 'cliente'
			};

			if (expiredToken) {
				await Cliente.invalidateToken(cliente.numero_carta);
				res.status(401).json({ success: false, message: 'Il token è scaduto!' });
				return;
			}

			next();
			return;
		}

		const impiegato = await Impiegato.getByToken(token);

		if (impiegato) {
			req.user = {
				...impiegato,
				id: impiegato.matricola,
				ruolo: impiegato.ruolo.toLowerCase() as 'chef' | 'amministratore' | 'cameriere',
				id_filiale: impiegato.ref_filiale
			};

			if (expiredToken) {
				await Impiegato.invalidateToken(impiegato.matricola);
				res.status(401).json({ success: false, message: 'Il token è scaduto!' });
				return;
			}

			next();
			return;
		}

		res.status(401).json({ success: false, message: 'Token non valido' });
		return;

	} catch (err) {
		console.error('❌ [AUTH ERROR] authMiddleware:', err);
		res.status(500).json({ success: false, message: 'Errore del server: ' + err });
		return;
	}
};

export default authMiddleware;