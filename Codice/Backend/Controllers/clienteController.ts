import Cliente, { ClienteData } from '../Models/cliente';
import AuthService from '../Services/authService';
import { Request, Response } from 'express';

class ClienteController {
	// Registra un nuovo cliente
	static async register(req: Request, res: Response): Promise<void> {
		try {
			const data: ClienteData = req.body;
			const result = await AuthService.register(data);

			res.status(200).json({
				success: true,
				message: 'Cliente registrato con successo',
				data: result
			});
		} catch (error: any) {
			console.error('❌ [CLIENTE ERROR] register:', error.message);
			res.status(400).json({
				success: false,
				message: 'Errore durante la registrazione: ' + error.message
			});
		}
	}

	// Restituisce i punti accumulati da un cliente autenticato
	static async getPoints(req: Request, res: Response): Promise<void> {
		const token = req.headers.authorization?.replace('Bearer ', '');

		if (!token) {
			res.status(403).json({
				success: false,
				message: 'Token mancante'
			});
			return;
		}

		try {
			const punti = await Cliente.getPoints(token);
			res.status(200).json({
				success: true,
				data: punti
			});
		} catch (error: any) {
			console.error('❌ [CLIENTE ERROR] getPoints:', error.message);
			res.status(403).json({
				success: false,
				message: error.message
			});
		}
	}
}

export default ClienteController;