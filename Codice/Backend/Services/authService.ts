import Cliente, { ClienteData } from '../Models/cliente';
import Impiegato, { ImpiegatoRecord } from '../Models/impiegato';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

import {
	credentials,
	LoginRecord,
	OurTokenPayload
} from '../Models/credentials';

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
}

export default AuthService;