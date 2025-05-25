import Cliente, {
	ClienteCredentials,
	ClienteData,
	ClienteRecord,
} from '../Models/cliente';
import { credentials, LoginRecord } from '../Models/credentials';
import Impiegato from '../Models/impiegato';

class AuthService {
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
		const user = await Cliente.findByEmail(input.emailOMatricola);

		if (user) {
			const passwordMatch = await Cliente.comparePassword(
				input.password,
				user.password
			);

			if (!passwordMatch) return;

			const token = await Cliente.updateToken(user.numero_carta);

			const loginRecord: LoginRecord = {
				token: token,
				ruolo: 'cliente',
				username: `${user.nome} ${user.cognome}`,
				avatar: user.image,
			};

			return loginRecord;
		}

		const impiegato = await Impiegato.findByMatricola(
			input.emailOMatricola
		);

		if (impiegato) {
			const passwordMatch = await Impiegato.comparePassword(
				input.password,
				impiegato.password
			);

			if (!passwordMatch) return;

			const token = await Impiegato.updateToken(impiegato.matricola);

			const loginRecord: LoginRecord = {
				token: token,
				ruolo: impiegato.ruolo.toLowerCase() as
					| 'chef'
					| 'cameriere'
					| 'amministratore',
				username: `${impiegato.nome} ${impiegato.cognome}`,
				avatar: impiegato.foto,
			};

			return loginRecord;
		}

		return;
	}
}

export default AuthService;
