import { MailTemplateData, MailOptions } from '../Interfaces/Email';

import Cliente from '../Models/cliente';
import Impiegato from '../Models/impiegato';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import {
	credentials,
	LoginRecord,
	OurTokenPayload,
} from '../Models/credentials';
import ClienteService from './clienteService';
import EmailService from './emailService';
import ImpiegatoService from './impiegatoService';

class AuthService {
	/**
	 * Genera un token JWT a partire da un payload utente.
	 * @param payload Oggetto con le informazioni essenziali dell'utente.
	 * @returns Token JWT firmato.
	 */
	static generateToken(payload: OurTokenPayload): string {
		const secretKey: Secret =
			process.env.JWT_SECRET_KEY || 'PasswordDelJWT';
		const options: SignOptions = { expiresIn: '1d' };
		return jwt.sign(payload, secretKey, options);
	}

	/**
	 * Verifica la validità e l'autenticità di un token JWT.
	 * @param token Token JWT da verificare.
	 * @returns Payload decodificato se valido.
	 * @throws Errore se il token non è valido o scaduto.
	 */
	static verifyToken(token: string): OurTokenPayload {
		try {
			return jwt.verify(
				token,
				process.env.JWT_SECRET_KEY || 'PasswordDelJWT'
			) as OurTokenPayload;
		} catch (err) {
			throw new Error('Token non valido o scaduto!');
		}
	}

	/**
	 * Effettua il login di un cliente o di un impiegato, restituendo il token e l'avatar.
	 * @param input Credenziali (email e password).
	 * @returns Token JWT e avatar associato se il login ha successo, undefined altrimenti.
	 */
	static async login(input: credentials): Promise<LoginRecord | undefined> {
		// Login come cliente
		const user = await Cliente.getByEmail(input.email);

		if (user) {
			const passwordMatch = await Cliente.comparePassword(
				input.password,
				user.password
			);
			if (!passwordMatch) return;

			// Costruzione del token
			const anno = user.data_nascita.slice(0, 4);
			const tokenPayload: OurTokenPayload = {
				id_utente: user.numero_carta,
				ruolo: 'cliente',
				username: `${user.nome}.${user.cognome}.${anno}`
					.toLowerCase()
					.replace(/\s+/g, ''),
			};

			const token = this.generateToken(tokenPayload);
			await Cliente.updateToken(user.numero_carta, token);

			return {
				token,
				avatar: user.image,
			};
		}

		// Login come impiegato
		const impiegatoCredentials = await Impiegato.getPassword(input.email);
		if (impiegatoCredentials) {
			const passwordMatch = await Impiegato.comparePassword(
				input.password,
				impiegatoCredentials.password
			);
			if (!passwordMatch) return;

			const impiegato = await Impiegato.getByEmail(input.email);
			if (!impiegato) {
				console.error(
					'❌ [AUTH ERROR] login: impiegato non trovato per email:',
					input.email
				);
				throw new Error('Impiegato non trovato');
			}

			const anno = impiegato.data_nascita.slice(0, 4);
			const tokenPayload: OurTokenPayload = {
				id_utente: impiegato.matricola,
				ruolo: impiegato.ruolo.toLowerCase() as
					| 'chef'
					| 'cameriere'
					| 'amministratore',
				username: `${impiegato.nome}.${impiegato.cognome}.${anno}`
					.toLowerCase()
					.replace(/\s+/g, ''),
				id_filiale: impiegato.ref_filiale,
			};

			const token = this.generateToken(tokenPayload);
			await Impiegato.updateToken(impiegato.matricola, token);

			return {
				token,
				avatar: impiegato.foto,
			};
		}

		return;
	}

	/**
	 * Invalida il token JWT dell'utente, effettuando il logout.
	 * @param token Token da invalidare.
	 * @returns True se il logout ha avuto successo, false altrimenti.
	 */
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

	/**
	 * Genera una password casuale sicura, lunga tra 6 e 12 caratteri.
	 * Include almeno una maiuscola, una minuscola, un numero e un carattere speciale.
	 * @returns Password generata.
	 */
	static generateRandomPassword(): string {
		const length = Math.floor(Math.random() * 7) + 6;

		const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const lowercase = 'abcdefghijklmnopqrstuvwxyz';
		const digits = '0123456789';
		const specialChars = '!@#$%^*()-_=+[]{}|;:?';

		let password = [
			uppercase[Math.floor(Math.random() * uppercase.length)],
			lowercase[Math.floor(Math.random() * lowercase.length)],
			digits[Math.floor(Math.random() * digits.length)],
			specialChars[Math.floor(Math.random() * specialChars.length)],
		];

		const allCharacters = uppercase + lowercase + digits + specialChars;
		for (let i = password.length; i < length; i++) {
			password.push(
				allCharacters[Math.floor(Math.random() * allCharacters.length)]
			);
		}

		// Shuffle per evitare pattern fissi
		password = password.sort(() => Math.random() - 0.5);

		return password.join('');
	}

	/**
	 * Effettua l'hashing sicuro della password usando bcrypt.
	 * @param password La password da criptare.
	 * @returns Password criptata.
	 */
	static async hashPassword(password: string): Promise<string> {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		return hashedPassword;
	}

	/**
	 * Recupera la password per un cliente o impiegato e invia la nuova via email.
	 * @param emailCliente Email dell'utente che ha richiesto il recupero.
	 * @throws Errore se l'email non è associata a nessun utente.
	 */
	static async recuperaPassword(emailCliente: string): Promise<void> {
		try {
			const cliente = await Cliente.getByEmail(emailCliente);
			if (cliente) {
				const newPassword = this.generateRandomPassword();
				await ClienteService.aggiornaPassword(
					cliente.numero_carta,
					newPassword
				);

				const mailTemplateData: MailTemplateData = {
					titolo: `Recupero Password`,
					contenuto: `Ciao ${cliente.nome} ${cliente.cognome}, ecco la tua nuova password: ${newPassword}`,
				};

				// Invio credenziali via email
				const mailOptions: MailOptions = {
					to: cliente.email,
					subject: 'Recupero Password',
					data: mailTemplateData,
				};

				return await EmailService.sendMail(mailOptions);
			}

			const impiegato = await Impiegato.getByEmail(emailCliente);
			if (impiegato) {
				const newPassword = this.generateRandomPassword();
				await ImpiegatoService.aggiornaPassword(
					impiegato.matricola,
					newPassword
				);

				const mailTemplateData: MailTemplateData = {
					titolo: `Recupero Password`,
					contenuto: `Ciao ${impiegato.nome} ${impiegato.cognome}, ecco la tua nuova password: ${newPassword}`,
				};

				// Invio credenziali via email
				const mailOptions: MailOptions = {
					to: impiegato.email,
					subject: 'Recupero Password',
					data: mailTemplateData,
				};

				return await EmailService.sendMail(mailOptions);
			}

			throw new Error('Email non trovata');
		} catch (err) {
			console.error('❌ [ClienteService Error] recuperaPassword:', err);
			throw new Error("Errore durante l'aggiornamento della password");
		}
	}
}

export default AuthService;
