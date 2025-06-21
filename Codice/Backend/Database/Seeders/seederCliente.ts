import cliente from '../../Models/cliente';

import { faker } from '@faker-js/faker';
import axios from 'axios';

const password = 'QuestaPasswordEMoltoSicura!';

async function getBase64(imageUrl: string): Promise<string> {
	try {
		// Scarica l'immagine
		const response = await axios.get(imageUrl, {
			responseType: 'arraybuffer',
		});

		// Converte l'immagine in Base64
		const base64Image = Buffer.from(response.data, 'binary').toString(
			'base64'
		);

		// Usa il prefisso di tipo immagine per renderla valida come dati Base64
		const base64ImageWithPrefix = `data:image/jpeg;base64,${base64Image}`;

		return base64ImageWithPrefix;
	} catch (error) {
		console.error("Errore durante la conversione dell'immagine:", error);
		throw error;
	}
}

async function generateCliente(count: number): Promise<string> {
	try {
		for (let i = 0; i < count; i++) {
			let sex = faker.person.sex() as 'male' | 'female';
			let nome = faker.person.firstName(sex);
			let cognome = faker.person.lastName(sex);
			let email = faker.internet.email({
				firstName: nome,
				lastName: cognome,
			});
			let data_nascita = faker.date.birthdate().toISOString();
			let punti = faker.number.int({ min: 0, max: 1000000 });
			let imageBase64 = await getBase64(
				faker.image.personPortrait({ sex: sex, size: 512 })
			);

			try {
				await cliente.create({
					nome: nome,
					cognome: cognome,
					email: email,
					password: password,
					data_nascita: data_nascita,
					image: imageBase64,
				});
				console.log(
					`👱 ${nome} ${cognome} è diventato nostro cliente!`
				);
			} catch (err) {
				console.error(
					`💀 ${nome} ${cognome} ci ha lasciato prematuramente. Causa di morte: ${err}`
				);
				throw err;
			}
		}

		return '👱 Popolati tutti i clienti!';
	} catch (err) {
		console.error(
			`💀 Errore durante la generazione dei clienti. Causa: ${err}`
		);
		throw err;
	}
}

export default generateCliente;
