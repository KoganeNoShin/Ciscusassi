import Cliente, { ClienteData } from '../Models/cliente';
import AuthService from '../Services/authService';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../Middleware/authMiddleware';
import ClienteService from '../Services/clienteService';

class ClienteController {
	// Registrazione Cliente
	static async register(req: Request, res: Response): Promise<void> {
		try {
			const { nome, cognome, data_nascita, image, email, nuovaPassword } = req.body;
			const data: ClienteData = {nome, cognome, data_nascita, image, email, password: nuovaPassword};
			const result = await ClienteService.register(data);

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
	static async getPuntiCliente(req: AuthenticatedRequest, res: Response): Promise<void> {
		try {
			const idCliente = Number(req.user?.id);

			const punti = await ClienteService.getPuntiCliente(idCliente);

			res.status(200).json({
				success: true,
				data: punti
			});
		} catch (err) {
			console.error('❌ [CLIENTE ERROR] getPuntiCliente:', err);
			res.status(500).json({
				success: false,
				message: 'Errore durante il recupero dei punti'
			});
		}
	}

	// Aggiornamento dati personali
	static async aggiornaDatiPersonali(req: AuthenticatedRequest, res: Response): Promise<void> {
		try {
			const idCliente = Number(req.user?.id);

			await ClienteService.aggiornaDatiPersonali(idCliente, req.body);

			res.status(200).json({
				success: true,
				message: 'Dati personali aggiornati con successo'
			});
		} catch (err) {
			console.error('❌ [CLIENTE ERROR] aggiornaDatiPersonali:', err);
			res.status(400).json({ success: false, message: String((err as Error).message) });
		}
	}

	// Aggiorna password
	static async aggiornaPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
		try {
			const idCliente = Number(req.user?.id);

			await ClienteService.aggiornaPassword(idCliente, req.body.nuovaPassword);

			res.status(200).json({
				success: true,
				message: 'Password aggiornata con successo'
			});
		} catch (err) {
			console.error('❌ [CLIENTE ERROR] aggiornaPassword:', err);
			res.status(400).json({ success: false, message: String((err as Error).message) });
		}
	}
}

export default ClienteController;