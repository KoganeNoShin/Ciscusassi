import prenotazione from '../../Models/prenotazione';
import torretta from '../../Models/torretta';
import cliente, { ClienteRecord } from '../../Models/cliente';
import ordine from '../../Models/ordine';
import prodotto from '../../Models/prodotto';
import ord_prod from '../../Models/ord_prod';
import pagamento from '../../Models/pagamento';

import { faker } from '@faker-js/faker';

export async function generatePrenotazione(count: number): Promise<string> {
	try {
		const torrette = await torretta.getAll();
		const idTorrette = torrette.map((t) => t.id_torretta);

		const clienti: ClienteRecord[] | null = await cliente.findAll();
		if (!clienti || clienti.length === 0)
			throw new Error('Nessun cliente trovato');

		for (let i = 0; i < count; i++) {
			let id_prenotazione: number;
			const numero_persone = faker.number.int({ min: 1, max: 8 });
			const ref_cliente_prenotazione =
				faker.number.int({ min: 0, max: 2 }) > 0
					? faker.helpers.arrayElement(clienti)
					: null;
			const ref_torretta = faker.helpers.arrayElement(idTorrette);
			const otp = faker.string.alphanumeric({ length: 6 });

			// 50% passate, 25% oggi, 25% future
			const oggiAlle1330 = new Date();
			oggiAlle1330.setHours(13, 30, 0, 0);

			const data_ora_prenotazione = faker.helpers.arrayElement([
				faker.date.past({ years: 2 }),
				oggiAlle1330,
				faker.date.soon({ days: 5 }),
			]);


			try {
				if (ref_cliente_prenotazione) {
					id_prenotazione = await prenotazione.create({
						numero_persone,
						data_ora_prenotazione: data_ora_prenotazione.toISOString(),
						ref_cliente: ref_cliente_prenotazione.numero_carta,
						ref_torretta,
					});
				} else {
					id_prenotazione = await prenotazione.createLocale(
						{
							numero_persone,
							data_ora_prenotazione: data_ora_prenotazione.toISOString(),
							ref_cliente: null,
							ref_torretta,
						},
						otp
					);
				}

				console.log(
					`Prenotazione di ${numero_persone} persone per il ${data_ora_prenotazione.toISOString()} con torretta ${ref_torretta} ${ref_cliente_prenotazione ? `online da ${ref_cliente_prenotazione.nome}` : 'in loco'}`
				);
			} catch (err) {
				console.error(`Errore inserimento prenotazione: ${err}`);
				throw err;
			}

			await generateOrdini(
				ref_cliente_prenotazione,
				id_prenotazione,
				data_ora_prenotazione,
				numero_persone,
				clienti
			);
		}

		return 'Prenotazioni generate con successo';
	} catch (err) {
		console.error(`Errore globale: ${err}`);
		throw err;
	}
}


async function generateOrdini(
	ref_cliente: ClienteRecord | null,
	id_prenotazione: number,
	data_ora_prenotazione: Date,
	numero_persone: number,
	clienti: ClienteRecord[]
): Promise<void> {
	let id_ordine: number;

	const creaOrdine = async (
		username: string,
		ref_cliente_val: number | null
	) => {
		id_ordine = await ordine.create({
			username_ordinante: username,
			ref_prenotazione: id_prenotazione,
			ref_pagamento: null,
			ref_cliente: ref_cliente_val,
		});
		await ordine.addPagamento(
			await generateOrdProd(id_ordine, data_ora_prenotazione),
			id_ordine
		);
		console.log(`🛎️  Ordine creato per ${username} (prenotazione ${id_prenotazione})`);
	};

	if (ref_cliente == null) {
		for (let j = 0; j < faker.number.int({ min: 1, max: numero_persone }); j++) {
			const nome = faker.person.firstName();
			const cognome = faker.person.lastName();
			await creaOrdine(`${nome}.${cognome}`, null);
		}
	} else {
		await creaOrdine(`${ref_cliente.nome}.${ref_cliente.cognome}`, ref_cliente.numero_carta);

		for (let j = 1; j < faker.number.int({ min: 1, max: numero_persone }); j++) {
			if (faker.number.int({ min: 0, max: 2 }) === 0) {
				const nome = faker.person.firstName();
				const cognome = faker.person.lastName();
				await creaOrdine(`${nome}.${cognome}`, null);
			} else {
				const altroCliente = faker.helpers.arrayElement(clienti);
				await creaOrdine(`${altroCliente.nome}.${altroCliente.cognome}`, altroCliente.numero_carta);
			}
		}
	}
}

async function generateOrdProd(
	id_ordine: number,
	data_ora_base: Date
): Promise<number> {
	const prodotti = await prodotto.getAll();
	if (!prodotti || prodotti.length === 0) throw new Error('Nessun prodotto trovato');

	const numProdotti = faker.number.int({ min: 3, max: 8 });
	let importo = 0;
	let data_ora = new Date(data_ora_base);

	for (let i = 0; i < numProdotti; i++) {
		const prod = faker.helpers.arrayElement(prodotti);
		importo += prod.costo;

		data_ora = new Date(data_ora.getTime() + 60 * 60 * 1000); // +1 ora per ogni prodotto

		try {
			await ord_prod.create({
				ref_ordine: id_ordine,
				ref_prodotto: prod.id_prodotto,
				is_romana: false,
				stato: 'CONSEGNATO',
			});
			console.log(`🧾 Prodotto ${prod.nome} aggiunto all’ordine ${id_ordine}`);
		} catch (err) {
			console.error(`❌ Errore su prodotto ${prod.nome}:`, err);
			throw err;
		}
	}

	try {
		const id_pagamento = await pagamento.create({
			importo,
			data_ora_pagamento: data_ora.toISOString(),
		});
		return id_pagamento;
	} catch (err) {
		console.error(`❌ Errore creazione pagamento ordine ${id_ordine}:`, err);
		throw err;
	}
}

export default generatePrenotazione;