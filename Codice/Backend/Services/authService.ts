import Cliente, { ClienteData } from '../Models/cliente';
import Impiegato, { ImpiegatoRecord } from '../Models/impiegato';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import {
	credentials,
	LoginRecord,
	OurTokenPayload
} from '../Models/credentials';
import ClienteService from './clienteService';
import EmailService from '../Email/emailService';
import ImpiegatoService from './impiegatoService';

class AuthService {
	// Genera un token JWT per l'utente
	static generateToken(payload: OurTokenPayload): string {
		const secretKey: Secret = process.env.JWT_SECRET_KEY || 'PasswordDelJWT';
		const options: SignOptions = { expiresIn: '1d' };
		return jwt.sign(payload, secretKey, options);
	}

	// Verifica la validità del token
	static verifyToken(token: string): OurTokenPayload {
		try {
			return jwt.verify(token, process.env.JWT_SECRET_KEY || 'PasswordDelJWT') as OurTokenPayload;
		} catch (err) {
			throw new Error('Token non valido o scaduto!');
		}
	}

	// Login per cliente o impiegato
	static async login(input: credentials): Promise<LoginRecord | undefined> {
		// Tentativo di login come cliente
		const user = await Cliente.getByEmail(input.email);

		if (user) {
			const passwordMatch = await Cliente.comparePassword(input.password, user.password);
			if (!passwordMatch) return;

			const anno = user.data_nascita.slice(0, 4);
			const tokenPayload: OurTokenPayload = {
				id_utente: user.numero_carta,
				ruolo: 'cliente',
				username: `${user.nome}.${user.cognome}.${anno}`.toLowerCase().replace(/\s+/g, '')
			};

			const token = this.generateToken(tokenPayload);
			await Cliente.updateToken(user.numero_carta, token);

			return {
				token,
				avatar: user.image
			};
		}

		// Tentativo di login come impiegato
		const impiegatoCredentials = await Impiegato.getPassword(input.email);
		if (impiegatoCredentials) {
			const passwordMatch = await Impiegato.comparePassword(input.password, impiegatoCredentials.password);
			if (!passwordMatch) return;

			const impiegato = await Impiegato.getByEmail(input.email);
			if (!impiegato) {
				console.error('❌ [AUTH ERROR] login: impiegato non trovato per email:', input.email);
				throw new Error('Impiegato non trovato');
			}

			const anno = impiegato.data_nascita.slice(0, 4);
			const tokenPayload: OurTokenPayload = {
				id_utente: impiegato.matricola,
				ruolo: impiegato.ruolo.toLowerCase() as 'chef' | 'cameriere' | 'amministratore',
				username: `${impiegato.nome}.${impiegato.cognome}.${anno}`.toLowerCase().replace(/\s+/g, ''),
				id_filiale: impiegato.ref_filiale
			};

			const token = this.generateToken(tokenPayload);
			await Impiegato.updateToken(impiegato.matricola, token);

			return {
				token,
				avatar: impiegato.foto
			};
		}

		return;
	}

	// Logout di un utente (cliente o impiegato)
	static async logout(token: string): Promise<boolean> {
		const cliente = await Cliente.getByToken(token);
		if (cliente) {
			await Cliente.invalidateToken(cliente.numero_carta);
			return true;
		}

		const impiegato = await Impiegato.getByToken(token);
		if (impiegato) {
			await Impiegato.invalidateToken(impiegato.matricola);
			return true;
		}

		return false;
	}

	// Genera Password casuale
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

	// hashPassword
	static async hashPassword(password: string): Promise<string> {
		// genSalt genera un seed casuale per l'hashing della password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
	
		return hashedPassword;
	}

	

    static async recuperaPassword(emailCliente: string): Promise<void> {
		try {
            const cliente = await Cliente.getByEmail(emailCliente);
            if (cliente) {
                const newPassword = this.generateRandomPassword();

            	await ClienteService.aggiornaPassword(cliente.numero_carta, newPassword);

				const mailOptions = {
					to: cliente.email,  // Email del cliente
					subject: 'Recupero Password',
					text: `Ecco la tua nuova password: ${newPassword}`,
					html: `Ecco la tua nuova password: ${newPassword}`,
				};

				return await EmailService.sendMail(mailOptions);
            }

            const impiegato = await Impiegato.getByEmail(emailCliente);
            if (impiegato) {
                const newPassword = this.generateRandomPassword();

            	await ImpiegatoService.aggiornaPassword(impiegato.matricola, newPassword);

				const mailOptions = {
					to: impiegato.email,  // Email del cliente
					subject: 'Recupero Password',
					text: `Ecco la tua nuova password: ${newPassword}`,
					html: `Ecco la tua nuova password: ${newPassword}`,
				};

				return await EmailService.sendMail(mailOptions);
            }

			throw new Error('Email non trovata');
        } catch (err) {
            console.error('❌ [ClienteService Error] recuperaPassword:', err);
            throw new Error('Errore durante l\'aggiornamento della password');
        }
	} 
}

export default AuthService;