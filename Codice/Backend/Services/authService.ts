import Cliente, {
	ClienteCredentials,
	ClienteData,
	ClienteRecord,
} from '../Models/cliente';
import {
	credentials,
	LoginRecord,
	OurTokenPayload,
} from '../Models/credentials';
import Impiegato, { ImpiegatoRecord } from '../Models/impiegato';

import jwt, { Secret, SignOptions } from 'jsonwebtoken';

class AuthService {
	static generateToken(payload: OurTokenPayload): string {
		// Impostazioni del token
		const secretKey: Secret =
			process.env.JWT_SECRET_KEY || 'PasswordDelJWT';

		const options: SignOptions = {
			expiresIn: '1d', // Impostiamo che ogni token dura un giorno
		};

		return jwt.sign(payload, secretKey, options);
	}

	static verifyToken(token: string) {
		try {
			const decoded = jwt.verify(
				token,
				process.env.JWT_SECRET_KEY || 'PasswordDelJWT'
			);

			return decoded;
		} catch (err) {
			throw new Error('Token non valido o scaduto!');
		}
	}

	static async register(input: ClienteData) {
		const existing = await Cliente.findByEmail(input.email!);

		if (existing) {
			throw new Error('Email già registrata');
		}

		const clienteData: ClienteData = {
			nome: input.nome,
			cognome: input.cognome,
			data_nascita: input.data_nascita,
			email: input.email,
			password: input.password,
			image: input.image,
		};

		return await Cliente.create(clienteData);
	}

	static async login(input: credentials): Promise<LoginRecord | undefined> {
		const user = await Cliente.findByEmail(input.email);

		if (user) {
			const passwordMatch = await Cliente.comparePassword(
				input.password,
				user.password
			);

			if (!passwordMatch) return;

			const tokenPayload: OurTokenPayload = {
				id_utente: user.numero_carta,
				ruolo: 'cliente',
				username: `${user.nome} ${user.cognome}`,
			};

			const token = this.generateToken(tokenPayload);

			await Cliente.updateToken(user.numero_carta, token);

			const loginRecord: LoginRecord = {
				token: token,
				avatar: user.image,
			};

			return loginRecord;
		}

		const impiegatoCredentials = await Impiegato.getPassword(input.email);

		if (impiegatoCredentials) {
			const passwordMatch = await Impiegato.comparePassword(
				input.password,
				impiegatoCredentials.password
			);

			if (!passwordMatch) return;

			const impiegato = await Impiegato.getByEmail(input.email);

			if (!impiegato) throw new Error('Impiegato non trovato');

			const tokenPayload: OurTokenPayload = {
				id_utente: impiegato.matricola,
				ruolo: impiegato.ruolo.toLowerCase() as
					| 'chef'
					| 'cameriere'
					| 'amministratore',
				username: `${impiegato.nome} ${impiegato.cognome}`,
				id_filiale: impiegato.ref_filiale,
			};

			const token = this.generateToken(tokenPayload);

			await Impiegato.updateToken(impiegato.matricola, token);

			const loginRecord: LoginRecord = {
				token: token,
				avatar: impiegato.foto,
			};

			return loginRecord;
		}

		return;
	}

	static async logout(token: string): Promise<boolean> {
		// Tipizza req come AuthenticatedRequest per accedere a req.user
		const cliente = await Cliente.findByToken(token);

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
