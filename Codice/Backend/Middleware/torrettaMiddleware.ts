import { Request, Response, NextFunction } from 'express';

/**
 * Middleware per autorizzare l’accesso esclusivamente a torrette fisiche.
 * Verifica la presenza dell’header `x-torretta-auth` e lo confronta con la variabile d’ambiente `TORRETTA_SECRET`.
 * Se la variabile d’ambiente non è definita, viene sollevato un errore in fase di avvio del server.
 *
 * @param req Richiesta HTTP
 * @param res Risposta HTTP
 * @param next Funzione per passare al middleware successivo
 * @returns 403 se il valore dell'header è assente o errato
 */

// Validazione della variabile d’ambiente all’avvio
const TORRETTA_HEADER = process.env.TORRETTA_HEADER;
const TORRETTA_SECRET = process.env.TORRETTA_SECRET;

if (!TORRETTA_HEADER) {
	throw new Error(
		"❌ Variabile d'ambiente TORRETTA_HEADER mancante. Definiscila nel file .env"
	);
}

if (!TORRETTA_SECRET) {
	throw new Error(
		"❌ Variabile d'ambiente TORRETTA_SECRET mancante. Definiscila nel file .env"
	);
}

const torrettaAuthMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.header(TORRETTA_HEADER);

	if (!authHeader || authHeader !== TORRETTA_SECRET) {
		console.warn(
			'🔒 [TORRETTA AUTH] Accesso negato: header non valido o mancante'
		);
		res.status(403).json({
			success: false,
			message: 'Accesso negato: torretta non autorizzata',
		});
		return;
	}

	next();
};

export default torrettaAuthMiddleware;
