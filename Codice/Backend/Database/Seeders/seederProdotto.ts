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

import prodottiJson from './prodotti.json';
const prodotti: ProdottoJson[] = prodottiJson as ProdottoJson[];

export async function generateProdotto(): Promise<string> {
	try {
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

			try {
				await prodotto.create({
					nome: nome,
					descrizione: descrizione,
					costo: costo,
					immagine: immagine,
					categoria: categoria,
				});
				console.log(
					`🍝 Piatto ${nome} di categoria ${categoria} al prezzo di ${costo}€ è stato aggiunto!'}`
				);
			} catch (err) {
				console.log(
					`♻️ Piatto ${nome} è andato a male! Causa di andata a male: ${err}`
				);
				throw err;
			}
		}
		try {
			await prodotto.attivaPiattoDelGiorno(1);
			`🍝 Piatto del giorno è stato aggiunto!'}`;
		} catch (err) {
			console.log(
				`♻️ Piatto del giorno è andato a male! Causa di andata a male: ${err}`
			);
			throw err;
		}

		return '🍝 Piatti generati con successo!';
	} catch (err) {
		console.error(`♻️ Errore durante la generazione dei piatti: ${err}`);
		throw err;
	}
}

export default generateProdotto;
