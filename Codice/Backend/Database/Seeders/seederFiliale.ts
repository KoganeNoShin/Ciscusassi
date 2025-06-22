import filiale from '../../Models/filiale';
import impiegato from '../../Models/impiegato';
import torretta from '../../Models/torretta';

import { faker } from '@faker-js/faker';
import axios from 'axios';

import immagini from './immaginiFiliali.json';

const password = 'Pwm30L!';

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

export async function generateFiliale(): Promise<string> {
	try {
		let numeroFiliali = 4;

		const vieFiliali = [
			'Via Vincenzo Piazza Martini, 45',
			'Via Palmerino, 52/A',
			'Via Catania, 17',
			'Via Saitta Longhi, 116G',
		];

		const longitudini = [
			'13.3636086',
			'13.3362260',
			'13.3496490',
			'13.3135463',
		];

		const latitudini = [
			'38.1029833',
			'38.0990595',
			'38.1279652',
			'38.0908109',
		];

		for (let i = 0; i < numeroFiliali; i++) {
			const num_tavoli = faker.number.int({ min: 10, max: 30 });
			let id_filiale;
			try {
				id_filiale = await filiale.create({
					comune: 'Palermo',
					indirizzo: vieFiliali[i],
					num_tavoli: num_tavoli,
					longitudine: longitudini[i],
					latitudine: latitudini[i],
					immagine: immagini[i],
				});
				console.log(
					`🏡 Abbiamo aperto la filiale in ${vieFiliali[i]}!`
				);
			} catch (err) {
				console.error(
					`🏚️ La filiale in ${vieFiliali[i]} è andata in bancarotta a causa di: ${err}`
				);
				throw err;
			}

			// --- CHEF ---
			let chef_sex = faker.person.sex() as 'male' | 'female';
			let chef_nome = faker.person.firstName(chef_sex);
			let chef_cognome = faker.person.lastName(chef_sex);
			let chef_email = faker.internet.email({
				firstName: chef_nome,
				lastName: chef_cognome,
			});
			let chef_data_nascita = faker.date.birthdate().toISOString();
			let chef_imageBase64 = await getBase64(
				faker.image.personPortrait({ sex: chef_sex, size: 512 })
			);
			let chef_ruolo = 'Chef';

			try {
				await impiegato.create({
					nome: chef_nome,
					cognome: chef_cognome,
					ruolo: chef_ruolo,
					foto: chef_imageBase64,
					password: password,
					email: chef_email,
					data_nascita: chef_data_nascita,
					ref_filiale: id_filiale,
				});
				console.log(
					`🥩 ${chef_nome} ${chef_cognome} è stato assunto in ${vieFiliali[i]} come ${chef_ruolo}!`
				);
			} catch (err) {
				console.error(
					`🤡 ${chef_nome} ${chef_cognome} è stato licenziato! Causa di licenziamento: ${err}`
				);
				throw err;
			}

			// --- CAMERIERI ---
			let nCamerieri = Math.floor(num_tavoli / 4);
			for (let j = 0; j < nCamerieri; j++) {
				let waiter_sex = faker.person.sex() as 'male' | 'female';
				let waiter_nome = faker.person.firstName(waiter_sex);
				let waiter_cognome = faker.person.lastName(waiter_sex);
				let waiter_email = faker.internet.email({
					firstName: waiter_nome,
					lastName: waiter_cognome,
				});
				let waiter_data_nascita = faker.date.birthdate().toISOString();
				let waiter_imageBase64 = await getBase64(
					faker.image.personPortrait({ sex: waiter_sex, size: 512 })
				);
				let waiter_ruolo = 'Cameriere';

				try {
					await impiegato.create({
						nome: waiter_nome,
						cognome: waiter_cognome,
						ruolo: waiter_ruolo,
						foto: waiter_imageBase64,
						password: password,
						email: waiter_email,
						data_nascita: waiter_data_nascita,
						ref_filiale: id_filiale,
					});
					console.log(
						`🍽️  ${waiter_nome} ${waiter_cognome} è stato assunto in ${vieFiliali[i]} come ${waiter_ruolo}!`
					);
				} catch (err) {
					console.error(
						`🤡 ${waiter_nome} ${waiter_cognome} è stato licenziato! Causa di licenziamento: ${err}`
					);
					throw err;
				}
			}

			// --- TORRETTE ---
			for (let j = 0; j < num_tavoli; j++) {
				try {
					await torretta.create({ ref_filiale: id_filiale });
					console.log(
						`🏰 Torretta aggiunta alla filiale in via ${vieFiliali[i]}!`
					);
				} catch (err) {
					console.error(
						`🧨 Torretta esplosa alla filiale in via ${vieFiliali[i]}! Causa di esplosione: ${err}`
					);
					throw err;
				}
			}
		}

		return '🏡 Filiali generate con successo!';
	} catch (err) {
		console.error(`🏚️ Errore durante la generazione delle filiali!`, err);
		throw err;
	}
}

export default generateFiliale;
