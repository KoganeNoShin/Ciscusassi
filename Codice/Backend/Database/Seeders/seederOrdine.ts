import ordine from '../../Models/ordine';
import prenotazione from '../../Models/prenotazione';
import cliente from '../../Models/cliente';
import pagamento from '../../Models/pagamento';

import { faker } from '@faker-js/faker';

async function generateOrdine(): Promise<string> {
	try {
		const clienti = await cliente.findAll();
		if (!clienti || clienti.length === 0) throw new Error("Nessun cliente trovato");
		const idClienti = clienti.map((c) => c.numero_carta);


		const prenotazioni = await prenotazione.findAll();

		for (const p of prenotazioni) {
			let nClienti = p.numero_persone;

			if (p.ref_cliente != null) {
				try {
					const clienteObj = await cliente.findByNumeroCarta(
						p.ref_cliente
					);
					if (!clienteObj) {
						console.error(
							`❌ Cliente con ref_cliente ${p.ref_cliente} non trovato!`
						);
						continue;
					}
					const data_ora_ordinazione = new Date(
						Date.parse(p.data_ora_prenotazione) +
							faker.number.int({ min: 10, max: 30 }) * 60000
					).toISOString();
					const username_ordinante = `${clienteObj.nome}.${clienteObj.cognome}.${clienteObj.data_nascita}`;
					const ref_prenotazione = p.id_prenotazione;

					await ordine.create({
						data_ora_ordinazione,
						username_ordinante,
						ref_prenotazione,
						ref_pagamento: null,
						ref_cliente: p.ref_cliente,
					});

					console.log(
						`🛎️  Inserito un ordine per conto di ${clienteObj.nome} ${clienteObj.cognome}, in data ${data_ora_ordinazione}!`
					);

					nClienti--;
				} catch (err) {
					console.error(
						`❌ Errore con ordine per ref_cliente ${p.ref_cliente}:`,
						err
					);
				}
			}

			for (let i = 0; i < nClienti; i++) {
				try {
					const data_ora_ordinazione = new Date(
						Date.parse(p.data_ora_prenotazione) +
							faker.number.int({ min: 10, max: 30 }) * 60000
					).toISOString();
					const username_ordinante = `${faker.person.firstName()}.${faker.person.lastName()}.${faker.date.birthdate().getUTCFullYear()}`;
					const ref_prenotazione = p.id_prenotazione;
					const ref_cliente =
						faker.number.int({ min: 1, max: 4 }) === 1
							? null
							: faker.helpers.arrayElement(idClienti);

					await ordine.create({
						data_ora_ordinazione,
						username_ordinante,
						ref_prenotazione,
						ref_pagamento: null,
						ref_cliente,
					});
					console.log(
						`🛎️  Inserito un ordine per conto di ${username_ordinante}, in data ${data_ora_ordinazione}!`
					);
				} catch (err) {
					console.error(`❌ Errore con ordine multiplo:`, err);
				}
			}
		}

		return '🛎️ Ordini generati con successo!';
	} catch (err) {
		console.error(`❌ Errore durante la generazione degli errori:`, err);
		throw err;
	}
}

export default generateOrdine;
