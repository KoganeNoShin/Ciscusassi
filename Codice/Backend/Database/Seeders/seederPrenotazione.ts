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
		const torrette = await torretta.findAll();
		const idTorrette = torrette.map((t) => t.id_torretta);

		const clienti : ClienteRecord[] | null = await cliente.findAll();
		if (!clienti || clienti.length === 0) throw new Error("Nessun cliente trovato");

		for (let i = 0; i < count; i++) {
			let id_prenotazione: number;

			let numero_persone: number = faker.number.int({ min: 1, max: 8 });
			let ref_cliente_prenotazione = faker.number.int({ min: 0, max: 2 }) > 0 ? faker.helpers.arrayElement(clienti) : null;
			let ref_torretta = faker.helpers.arrayElement(idTorrette);
			let data_ora_prenotazione = faker.date.past({years: 3});
			let otp = faker.string.alphanumeric({ length: 6 });

			try {
				id_prenotazione = await prenotazione.create({numero_persone: numero_persone, ref_cliente: ref_cliente_prenotazione?.numero_carta, ref_torretta: ref_torretta, data_ora_prenotazione: data_ora_prenotazione.toISOString(), otp: otp});
				console.log(`📆  Aggiunta la prenotazione di ${numero_persone} persone giorno ${data_ora_prenotazione}. Gli è stata assegnata la torretta ${ref_torretta} ed è stata ${ref_cliente_prenotazione == null ? 'creata in loco.' : `creata online dall'utente ${ref_cliente_prenotazione.nome}.`}`);
			} catch (err) {
				console.log(`❌ Impossibile aggiungere la prenotazione in giorno ${data_ora_prenotazione}. Motivo: ${err}`);
				throw err;
			}

			await generateOrdini(ref_cliente_prenotazione, id_prenotazione, data_ora_prenotazione, numero_persone, clienti);
		}
		return '📆 Prenotazioni generate con successo';
	} catch (err) {
		console.error(
			`❌ Errore durante la generazione delle prenotazioni: ${err}`
		);
		throw err;
	}
}

async function generateOrdini(ref_cliente_prenotazione: ClienteRecord | null, id_prenotazione: number, data_ora_prenotazione: Date, numero_persone: number, clienti: ClienteRecord[]): Promise<void> {
	let id_ordine: number;
	
	if(ref_cliente_prenotazione == null) {
		for(let j = 0; j < faker.number.int({min: 1, max: numero_persone}); j++) {
			let nome = faker.person.firstName();
			let cognome = faker.person.lastName();
			
			try {
				id_ordine = await ordine.create({
					data_ora_ordinazione: data_ora_prenotazione.toISOString(),
					username_ordinante: `${nome}.${cognome}`,
					ref_prenotazione: id_prenotazione,
					ref_pagamento: null,
					ref_cliente: null
				});
				console.log(`🛎️  Inserito un ordine per conto di ${nome} ${cognome}, in prenotazione ${id_prenotazione}!`);
				await ordine.addPagamento(await generateOrdProd(id_ordine, data_ora_prenotazione), id_ordine);
			} catch (err) {
				console.error(`❌ Errore durante l'inserimento dell'ordine per ${nome} ${cognome}: ${err}`);
				throw err;
			}
		}
	} else {
		try {
			id_ordine = await ordine.create({
				data_ora_ordinazione: data_ora_prenotazione.toISOString(),
				username_ordinante: `${ref_cliente_prenotazione.nome}.${ref_cliente_prenotazione.cognome}`,
				ref_prenotazione: id_prenotazione,
				ref_pagamento: null,
				ref_cliente: ref_cliente_prenotazione.numero_carta
			});
			await ordine.addPagamento(await generateOrdProd(id_ordine, data_ora_prenotazione), id_ordine);
			console.log(`🛎️  Inserito un ordine per conto di ${ref_cliente_prenotazione.nome} ${ref_cliente_prenotazione.cognome}, in prenotazione ${id_prenotazione}!`);
		} catch (err) {
			console.error(`❌ Errore durante l'inserimento dell'ordine per ${ref_cliente_prenotazione.nome} ${ref_cliente_prenotazione.cognome}: ${err}`);
			throw err;
		}

		for(let j = 1; j < faker.number.int({min: 1, max: numero_persone}); j++) {
			if(faker.number.int({ min: 0, max: 2 }) == 0) {
				let nome = faker.person.firstName();
				let cognome = faker.person.lastName();
				try {
					id_ordine = await ordine.create({
					data_ora_ordinazione: data_ora_prenotazione.toISOString(),
					username_ordinante: `${nome}.${cognome}`,
					ref_prenotazione:id_prenotazione,
					ref_pagamento: null,
					ref_cliente: null
					});
					await ordine.addPagamento(await generateOrdProd(id_ordine, data_ora_prenotazione), id_ordine);
					console.log(`🛎️  Inserito un ordine per conto di ${nome} ${cognome}, in prenotazione ${id_prenotazione}!`);
				} catch (err) {
					console.error(`❌ Errore durante l'inserimento dell'ordine per ${nome} ${cognome}: ${err}`);
					throw err;
				}
				
			} else {
				let ref_cliente = faker.helpers.arrayElement(clienti);
				try {
					id_ordine = await ordine.create({
						data_ora_ordinazione: data_ora_prenotazione.toISOString(),
						username_ordinante: `${ref_cliente.nome}.${ref_cliente.cognome}`,
						ref_prenotazione:id_prenotazione,
						ref_pagamento: null,
						ref_cliente: ref_cliente.numero_carta
						});
						await ordine.addPagamento(await generateOrdProd(id_ordine, data_ora_prenotazione), id_ordine);
						console.log(`🛎️  Inserito un ordine per conto di ${ref_cliente.nome} ${ref_cliente.cognome}, in prenotazione ${id_prenotazione}!`);
				} catch (err) {
					console.error(`❌ Errore durante l'inserimento dell'ordine per ${ref_cliente.nome} ${ref_cliente.cognome}: ${err}`);
					throw err;
				}
			}
		}
	}
}

async function generateOrdProd(id_ordine : number, data_ora_ordinazione: Date): Promise<number> {
	let id_pagamento: number;
	let prodotti = await prodotto.getAll();
	if (!prodotti || prodotti.length === 0) throw new Error("Nessun prodotto trovato");
	
	let numProdotti = faker.number.int({ min: 3, max: 8 });

	let importo: number = 0;

	for (let j = 0; j < numProdotti; j++) {
		let prodotto = faker.helpers.arrayElement(prodotti);
		let is_romana = false;
		let stato = 'CONSEGNATO';
		importo += prodotto.costo;
		data_ora_ordinazione = new Date(data_ora_ordinazione.getTime() + 60 * 60 * 1000);

		try {
			await ord_prod.create({
				ref_ordine: id_ordine,
				ref_prodotto: prodotto.id_prodotto,
				is_romana: is_romana,
				stato: stato,
			});
			console.log(`🧾 Prodotto ${prodotto.nome} aggiunto all'ordine ${id_ordine}`);
		} catch (err) {
			console.error(`❌ Errore nell'aggiunta di prodotto ${prodotto.nome} a ordine ${id_ordine}:`, err);
			throw err;
		}
	}

	try {
		id_pagamento = await pagamento.create({
			importo: importo,
			data_ora_pagamento: data_ora_ordinazione.toISOString()
		})
	} catch(err) {
		console.error(`❌ Errore durante l'inserimento del pagamento per l'ordine ${id_ordine}: ${err}`);
		throw err;
	}

	return id_pagamento;
}

export default generatePrenotazione;