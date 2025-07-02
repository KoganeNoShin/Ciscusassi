import Cliente, { ClienteData } from "../Models/cliente";
import bcrypt from 'bcryptjs';

class ClienteService {
    // Registrazione Cliente
	static async register(input: ClienteData): Promise<number> {
		const existing = await Cliente.getByEmail(input.email);
		if (existing) {
			console.error('❌ [ClienteService Error] register: email già registrata:', input.email);
			throw new Error('Email già registrata');
		}

		const salt = await bcrypt.genSalt(10);
		input.password = await bcrypt.hash(input.password, salt); /// Encrypting Password
		return await Cliente.create(input);
	}

    // Ottenimento punti Cliente
    static async getPuntiCliente(idCliente: number): Promise<number> {
        try {
            return await Cliente.getPuntiCliente(idCliente);
        } catch (err) {
            console.error('❌ [ClienteService Error] getPuntiCliente:', err);
            throw new Error('Errore durante il recupero dei punti del cliente');
        }
    }
}

export default ClienteService;