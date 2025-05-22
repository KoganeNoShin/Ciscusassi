import prodotto from '../../Models/prodotto';

import { faker } from '@faker-js/faker';

import path from 'path'; // Modulo per gestire i percorsi
import axios from 'axios';
import fs from 'fs'; // Modulo per leggere il file

interface ProdottoJson {
	nome: string;
	descrizione: string;
	categoria: string;
	immagine: string;
}

// Funzione per leggere il file JSON
async function readProdottiFromFile(): Promise<ProdottoJson[]> {
	const filePath = path.join(__dirname, 'prodotti.json');

	try {
		const data = fs.readFileSync(filePath, 'utf8');
		const prodotti = JSON.parse(data);
		return prodotti;
	} catch (error) {
		console.error(
			"Errore durante la lettura del file 'prodotti.json':",
			error
		);
		throw error;
	}
}

export async function generateProdotto(): Promise<string> {
	try {
		let prodotti = await readProdottiFromFile();

		for (let i = 0; i < prodotti.length; i++) {
			let nome = prodotti[i].nome;
			let descrizione = prodotti[i].descrizione;
			let costo = faker.number.float({
				min: 8,
				max: 14,
				fractionDigits: 2,
			});
			let immagine = 'data:image/jpeg;base64,' + prodotti[i].immagine;
			let categoria = prodotti[i].categoria;
			let is_piatto_giorno = i === 0;

			try {
				await prodotto.create({
					nome: nome,
					descrizione: descrizione,
					costo: costo,
					immagine: immagine,
					categoria: categoria,
					is_piatto_giorno: is_piatto_giorno,
				});
				console.log(
					`🍝 Piatto ${nome} di categoria ${categoria} al prezzo di ${costo}€ è stato aggiunto! ${is_piatto_giorno ? 'È il piatto del giorno!' : ''}`
				);
			} catch (err) {
				console.log(
					`♻️ Piatto ${nome} è andato a male! Causa di andata a male: ${err}`
				);
				throw err;
			}
		}

		return '🍝 Piatti generati con successo!';
	} catch (err) {
		console.error(`♻️ Errore durante la generazione dei piatti: ${err}`);
		throw err;
	}
}

export default generateProdotto;
