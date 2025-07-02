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

    static async aggiornaDatiPersonali(idCliente: number, data: Partial<ClienteData>): Promise<void> {
        try {
            const cliente = await Cliente.getByNumeroCarta(idCliente); // serve per verificare che abbia cambiato email
            if (!cliente) throw new Error('Cliente non trovato');

            // Se viene passata una nuova email, controlla che non sia già usata da altri
            if (data.email && data.email !== cliente.email) {
                const altro = await Cliente.getByEmail(data.email);
                if (altro) throw new Error('Email già in uso da un altro cliente');
            }

            await Cliente.update(idCliente, data);
        } catch (err) {
            console.error('❌ [ClienteService Error] aggiornaDatiPersonali:', err);
            throw new Error('Errore durante l\'aggiornamento dei dati personali');
        }
    }

    static async aggiornaPassword(idCliente: number, passwordChiara: string): Promise<void> {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(passwordChiara, salt);

            await Cliente.aggiornaPassword(idCliente, hashedPassword);
        } catch (err) {
            console.error('❌ [ClienteService Error] aggiornaPassword:', err);
            throw new Error('Errore durante l\'aggiornamento della password');
        }
    }
}

export default ClienteService;