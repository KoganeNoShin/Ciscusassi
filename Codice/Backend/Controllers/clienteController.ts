import { ClienteData } from '../Models/cliente';
import ClienteService from '../Services/clienteService';

import { Request, Response } from 'express';

class ClienteController {
    static async register(req: Request, res: Response): Promise<void> {
        try {
            const data: ClienteData = req.body;
            const result = await ClienteService.register(data);

            res.status(200).json({
                success: true,
                message: "Cliente registrato con successo",
                data: result
            });

        }
        catch (error: any) {
            res.status(400).json({
                success: false,
                message: "Errore durante la registrazione" + error.message,
            });
        }
    }

    static async login(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            success: true,
            message: 'Login effettuato'
        });
    }

    static async logout(req: Request, res: Response): Promise<void> {
        // #Todo: Invalidare il token
        res.status(200).json({
            success: true,
            message: 'Logout effettuato'
        });
    }

}

export default ClienteController;