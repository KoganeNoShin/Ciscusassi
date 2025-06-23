import prenotazione from '../../Models/prenotazione';
import torretta from '../../Models/torretta';
import cliente, { ClienteRecord } from '../../Models/cliente';
import ordine from '../../Models/ordine';
import prodotto from '../../Models/prodotto';
import ord_prod from '../../Models/ord_prod';
import pagamento from '../../Models/pagamento';

import { faker } from '@faker-js/faker';
import Filiale from '../../Models/filiale';
import PrenotazioneService from '../../Services/prenotazioneService';

export async function generatePrenotazione(count: number): Promise<string> {
	try {
		const filiali = await Filiale.getAll();
		const clienti: ClienteRecord[] | null = await cliente.findAll();
		if (!clienti || clienti.length === 0)
			throw new Error('Nessun cliente trovato');

		const perTipo = {
			passato: Math.max(0, count - 20),
			oggi: Math.min(10, count),
			futuro: Math.min(10, count - 10),
		};

		const getDataPrenotazione = (tipo: keyof typeof perTipo): Date => {
			if (tipo === 'oggi') {
				const d = new Date();
				d.setHours(13, 30, 0, 0);
				return d;
			} else if (tipo === 'futuro') {
				return faker.date.soon({ days: 5 });
			} else {
				return faker.date.past({ years: 2 });
			}
		};

		for (const filialeScelta of filiali) {
			for (const tipo of Object.keys(
				perTipo
			) as (keyof typeof perTipo)[]) {
				for (let i = 0; i < perTipo[tipo]; i++) {
					const dataPren = getDataPrenotazione(tipo);
					const torretteLibere = await torretta.getTorretteLibere(
						filialeScelta.id_filiale,
						dataPren.toISOString()
					);

					if (torretteLibere.length === 0) {
						console.warn(
							`⚠️ Nessuna torretta libera per ${filialeScelta.indirizzo} alle ${dataPren.toISOString()}`
						);
						continue;
					}

					const numero_persone = faker.number.int({ min: 1, max: 8 });
					const ref_cliente_prenotazione =
						faker.number.int({ min: 0, max: 2 }) > 0
							? faker.helpers.arrayElement(clienti)
							: null;
					const ref_torretta =
						faker.helpers.arrayElement(torretteLibere).id_torretta;
					const otp = faker.string.alphanumeric({ length: 6 });

					let id_prenotazione: number;

					if (ref_cliente_prenotazione) {
						id_prenotazione = await PrenotazioneService.prenotaLoco({
							numero_persone,
							data_ora_prenotazione: dataPren.toString(),
							ref_cliente: ref_cliente_prenotazione.numero_carta,
							ref_filiale: filialeScelta.id_filiale,
						});
					} else {
						id_prenotazione = await PrenotazioneService.prenotaLoco(
							{
								numero_persone,
								data_ora_prenotazione: dataPren.toString(),
								ref_cliente: null,
								ref_filiale: filialeScelta.id_filiale,
							}
						);
					}

					console.log(
						`Prenotazione ${tipo} - ${id_prenotazione} per ${numero_persone} persone (${ref_torretta})`
					);

					if (tipo !== 'futuro') {
						await generateOrdini(
							ref_cliente_prenotazione,
							id_prenotazione,
							dataPren,
							numero_persone,
							clienti,
							tipo // <- AGGIUNTO tipo prenotazione
						);
					} else {
						console.log(
							`🕒 Prenotazione futura: nessun ordine per ${id_prenotazione}`
						);
					}
				}
			}
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
	clienti: ClienteRecord[],
	tipo: 'passato' | 'oggi' | 'futuro' // Aggiunto parametro
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
			await generateOrdProd(id_ordine, data_ora_prenotazione, tipo),
			id_ordine
		);
		console.log(
			`🛎️  Ordine creato per ${username} (prenotazione ${id_prenotazione})`
		);
	};

	if (ref_cliente == null) {
		for (
			let j = 0;
			j < faker.number.int({ min: 1, max: numero_persone });
			j++
		) {
			const nome = faker.person.firstName();
			const cognome = faker.person.lastName();
			await creaOrdine(`${nome}.${cognome}`, null);
		}
	} else {
		await creaOrdine(
			`${ref_cliente.nome}.${ref_cliente.cognome}`,
			ref_cliente.numero_carta
		);

		for (
			let j = 1;
			j < faker.number.int({ min: 1, max: numero_persone });
			j++
		) {
			if (faker.number.int({ min: 0, max: 2 }) === 0) {
				const nome = faker.person.firstName();
				const cognome = faker.person.lastName();
				await creaOrdine(`${nome}.${cognome}`, null);
			} else {
				const altroCliente = faker.helpers.arrayElement(clienti);
				await creaOrdine(
					`${altroCliente.nome}.${altroCliente.cognome}`,
					altroCliente.numero_carta
				);
			}
		}
	}
}

async function generateOrdProd(
	id_ordine: number,
	data_ora_base: Date,
	tipo: 'passato' | 'oggi' | 'futuro'
): Promise<number> {
	const prodotti = await prodotto.getAll();
	if (!prodotti || prodotti.length === 0)
		throw new Error('Nessun prodotto trovato');

	const numProdotti = faker.number.int({ min: 3, max: 8 });
	let importo = 0;
	let data_ora = new Date(data_ora_base);

	for (let i = 0; i < numProdotti; i++) {
		const prod = faker.helpers.arrayElement(prodotti);
		importo += prod.costo;
		data_ora = new Date(data_ora.getTime() + 60 * 60 * 1000); // +1h

		let stato: string;
		if (tipo === 'passato') {
			stato = 'in-consegna';
		} else if (tipo === 'oggi') {
			stato = faker.helpers.arrayElement([
				'in-consegna',
				'preparazione',
				'consegnato',
			]);
		} else {
			stato = 'attesa'; // fallback se mai chiamato (ma non verrà)
		}

		try {
			await ord_prod.create({
				ref_ordine: id_ordine,
				ref_prodotto: prod.id_prodotto,
				is_romana: false,
				stato,
			});
			console.log(
				`🧾 Prodotto ${prod.nome} aggiunto all’ordine ${id_ordine}`
			);
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
		console.error(
			`❌ Errore creazione pagamento ordine ${id_ordine}:`,
			err
		);
		throw err;
	}
}

export default generatePrenotazione;
