import EmailService from "../Email/emailService";
import Cliente, { ClienteData } from "../Models/cliente";
import AuthService from "./authService";

class ClienteService {
    /**
     * Registra un nuovo cliente nel sistema.
     * - Verifica che l'email non sia già presente.
     * - Cripta la password.
     * - Inserisce il cliente nel database.
     * @param input Dati del cliente (nome, cognome, email, password, ecc.)
     * @returns ID del nuovo cliente creato.
     * @throws Errore se l'email è già registrata.
     */
	static async register(input: ClienteData): Promise<number> {
		const existing = await Cliente.getByEmail(input.email);
		if (existing) {
			console.error('❌ [ClienteService Error] register: email già registrata:', input.email);
			throw new Error('Email già registrata');
		}

        input.password = await AuthService.hashPassword(input.password);
		return await Cliente.create(input);
	}

    /**
     * Restituisce i punti fedeltà associati al cliente.
     * @param idCliente Numero carta del cliente.
     * @returns Numero di punti.
     */
    static async getPuntiCliente(idCliente: number): Promise<number> {
        try {
            return await Cliente.getPuntiCliente(idCliente);
        } catch (err) {
            console.error('❌ [ClienteService Error] getPuntiCliente:', err);
            throw new Error('Errore durante il recupero dei punti del cliente');
        }
    }

    /**
     * Aggiorna i dati personali del cliente.
     * - Controlla che l'email non sia già usata da altri se viene modificata.
     * - Aggiorna solo i campi forniti (Partial).
     * @param idCliente Numero carta del cliente.
     * @param data Campi da aggiornare (nome, cognome, email, ecc.)
     */
    static async aggiornaDatiPersonali(idCliente: number, data: Partial<ClienteData>): Promise<void> {
        try {
            const cliente = await Cliente.getByNumeroCarta(idCliente); // Verifica esistenza
            if (!cliente) throw new Error('Cliente non trovato');

            // Se l'email è cambiata, controlla che non sia già in uso
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

    /**
     * Aggiorna la password del cliente.
     * - La password fornita viene criptata con hash sicuro.
     * @param idCliente Numero carta del cliente.
     * @param passwordChiara Password in chiaro da aggiornare.
     */
    static async aggiornaPassword(idCliente: number, passwordChiara: string): Promise<void> {
        try {
            const hashedPassword = await AuthService.hashPassword(passwordChiara);
            await Cliente.aggiornaPassword(idCliente, hashedPassword);
        } catch (err) {
            console.error('❌ [ClienteService Error] aggiornaPassword:', err);
            throw new Error('Errore durante l\'aggiornamento della password');
        }
    }

    /**
     * Aggiorna l'email del cliente.
     * - Verifica che la nuova email non sia già registrata.
     * @param idCliente Numero carta del cliente.
     * @param newEmail Nuova email da associare.
     */
    static async aggiornaEmail(idCliente: number, newEmail: string): Promise<void> {
		try {
            const existing = await Cliente.getByEmail(newEmail);
            if (existing) {
                console.error('❌ [ClienteService Error] aggiornaEmail: email già registrata:', newEmail);
                throw new Error('Email già registrata');
            }
            return await Cliente.aggiornaEmail(idCliente, newEmail);
        } catch (err) {
            console.error('❌ [ClienteService Error] aggiornaEmail:', err);
            throw new Error('Errore durante l\'aggiornamento della email');
        }
	}
}

export default ClienteService;