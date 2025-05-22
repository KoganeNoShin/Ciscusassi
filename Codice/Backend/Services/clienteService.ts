import Cliente, {
	ClienteCredentials,
	ClienteData,
	ClienteRecord,
} from '../Models/cliente';

class ClienteService {
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
			punti: 0,
		};

		return await Cliente.create(clienteData);
	}

	static async login(input: ClienteCredentials): Promise<boolean> {
		const user = await Cliente.findByEmail(input.email);

		if (user) {
			const passwordMatch = await Cliente.comparePassword(
				input.password,
				user.password
			);

			return passwordMatch;
		} else {
			return false;
		}
	}
}

export default ClienteService;
