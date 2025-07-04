import EmailService from "../Email/emailService";
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

    static generateRandomPassword(): string {
    // Verifica che la lunghezza sia tra 6 e 12 caratteri
    const length = Math.floor(Math.random() * 7) + 6; // Assicura che la lunghezza sia tra 6 e 12

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const specialChars = '!@#$%^*()-_=+[]{}|;:?';

    // Assicurazionne che la password contenga almeno un carattere di ogni tipo
    let password = [
        uppercase[Math.floor(Math.random() * uppercase.length)],
        lowercase[Math.floor(Math.random() * lowercase.length)],
        digits[Math.floor(Math.random() * digits.length)],
        specialChars[Math.floor(Math.random() * specialChars.length)]
    ];

    // Riempi il resto della password con caratteri casuali
    const allCharacters = uppercase + lowercase + digits + specialChars;
    for (let i = password.length; i < length; i++) {
        password.push(allCharacters[Math.floor(Math.random() * allCharacters.length)]);
    }

    // Mischia i caratteri della password per evitare che i tipi obbligatori siano sempre nelle stesse posizioni
    password = password.sort(() => Math.random() - 0.5);

    return password.join('');
}

    static async recuperaPassword(emailCliente: string): Promise<void> {
		try {
            const cliente = await Cliente.getByEmail(emailCliente);
            if (!cliente) {
                throw new Error('Cliente non trovato');
            }
            const newPassword = this.generateRandomPassword();

            await this.aggiornaPassword(cliente.numero_carta, newPassword);

            const mailOptions = {
                to: cliente.email,  // Email del cliente
                subject: 'Recupero Password',
                text: `Ecco la tua nuova password: ${newPassword}`,
                html: `Ecco la tua nuova password: ${newPassword}`,
            };

            await EmailService.sendMail(mailOptions);
        } catch (err) {
            console.error('❌ [ClienteService Error] recuperaPassword:', err);
            throw new Error('Errore durante l\'aggiornamento della password');
        }
	} 
}

export default ClienteService;