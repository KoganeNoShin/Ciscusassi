import { ClienteData } from '../Models/cliente';
import AuthService from '../Services/authService';

import { Request, Response } from 'express';

class ClienteController {
	static async register(req: Request, res: Response): Promise<void> {
		try {
			const data: ClienteData = req.body;
			const result = await AuthService.register(data);

			res.status(200).json({
				success: true,
				message: 'Cliente registrato con successo',
				data: result,
			});
		} catch (error: any) {
			res.status(400).json({
				success: false,
				message: 'Errore durante la registrazione: ' + error.message,
			});
		}
	}
}

export default ClienteController;
