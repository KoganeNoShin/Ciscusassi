import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware per la validazione dei parametri della richiesta.
 * Utilizza i risultati di express-validator per verificare la presenza di errori nei campi validati.
 *
 * Se ci sono errori di validazione, la richiesta viene bloccata e viene restituito un JSON con l'elenco degli errori.
 *
 * @param req Oggetto `Request` di Express contenente i dati della richiesta
 * @param res Oggetto `Response` di Express utilizzato per restituire l'errore, se presente
 * @param next Funzione `NextFunction` per passare al middleware successivo
 *
 * @returns In caso di errori, risponde con `400 Bad Request` e un array degli errori di validazione.
 *          In caso contrario, prosegue con il middleware successivo.
 */
export const validateMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}
	next();
};

export default validateMiddleware;