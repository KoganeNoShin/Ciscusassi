import Filiale from '../../Models/filiale';
import Cliente, { ClienteRecord } from '../../Models/cliente';
import Torretta from '../../Models/torretta';
import Prenotazione from '../../Models/prenotazione';
import Ordine from '../../Models/ordine';
import OrdProd from '../../Models/ord_prod';
import Prodotto from '../../Models/prodotto';
import Pagamento from '../../Models/pagamento';
import { faker } from '@faker-js/faker';

const ORARI_VALIDI = ['12:00', '13:30', '19:30', '21:00'];

export async function generatePrenotazioni(count: number): Promise<string> {
	try {
		const filiali = await Filiale.getAll();
		const clienti: ClienteRecord[] = await Cliente.getAll();
		if (!clienti.length) throw new Error('Nessun cliente trovato');

		const distribuzionePrenotazioni = {
			passato: Math.max(0, count - 20),
			oggi: Math.min(10, count),
			futuro: Math.min(10, count - 10),
		};

		for (const filiale of filiali) {
			for (const tipo of Object.keys(distribuzionePrenotazioni) as (keyof typeof distribuzionePrenotazioni)[]) {
				for (let i = 0; i < distribuzionePrenotazioni[tipo]; i++) {
					const dataPren = getDataPrenotazione(tipo);
					const torretteLibere = await Torretta.getTorretteLibere(filiale.id_filiale, dataPren.toISOString());

					if (!torretteLibere.length) {
						console.warn(`⚠️ Nessuna torretta libera per ${filiale.indirizzo} alle ${dataPren}`);
						continue;
					}

					const numero_persone = faker.number.int({ min: 1, max: 8 });
					const clientePrenotazione = faker.number.int({ min: 0, max: 2 }) > 0 ? faker.helpers.arrayElement(clienti) : null;
					const torrettaSelezionata = faker.helpers.arrayElement(torretteLibere);

					const id_prenotazione = await Prenotazione.create({
						numero_persone,
						data_ora_prenotazione: dataPren.toISOString(),
						ref_cliente: clientePrenotazione ? clientePrenotazione.numero_carta : null,
						ref_torretta: torrettaSelezionata.id_torretta,
					});

					console.log(`✅ Prenotazione ${tipo} creata con ID ${id_prenotazione}`);

					if (tipo === 'passato') {
						await generateOrdini(clientePrenotazione, id_prenotazione, dataPren, numero_persone, clienti);
					} else {
						console.log(`🕒 Nessun ordine per prenotazione ${tipo} ID ${id_prenotazione}`);
					}
				}
			}
		}

		return 'Prenotazioni generate con successo';
	} catch (err) {
		console.error(`❌ Errore nella generazione prenotazioni:`, err);
		throw err;
	}
}

function getDataPrenotazione(tipo: 'passato' | 'oggi' | 'futuro'): Date {
	const data = new Date();
	const orario = faker.helpers.arrayElement(ORARI_VALIDI).split(':').map(Number);

	data.setHours(orario[0], orario[1], 0, 0);

	if (tipo === 'futuro') data.setDate(data.getDate() + faker.number.int({ min: 1, max: 5 }));
	else if (tipo === 'passato') data.setDate(data.getDate() - faker.number.int({ min: 30, max: 730 }));

	return data;
}

async function generateOrdini(
	clientePrenotazione: ClienteRecord | null,
	id_prenotazione: number,
	dataPrenotazione: Date,
	numero_persone: number,
	clienti: ClienteRecord[]
): Promise<void> {
	const numeroOrdini = faker.number.int({ min: 1, max: numero_persone });
	const prodotti = await Prodotto.getAll();

	for (let i = 0; i < numeroOrdini; i++) {
		const cliente = clientePrenotazione || faker.helpers.arrayElement(clienti);
		const username = `${cliente.nome}.${cliente.cognome}`;

		const id_ordine = await Ordine.create({
			username_ordinante: username,
			ref_prenotazione: id_prenotazione,
			ref_cliente: cliente.numero_carta,
		});

		const ordProdInput = Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => ({
			ref_ordine: id_ordine,
			ref_prodotto: faker.helpers.arrayElement(prodotti).id_prodotto,
			is_romana: false,
			stato: 'consegnato',
		}));

		await Promise.all(ordProdInput.map(op => OrdProd.create(op)));
		const importoTotale = ordProdInput.reduce((sum, op) => sum + prodotti.find(p => p.id_prodotto === op.ref_prodotto)!.costo, 0);
		const id_pagamento = await Pagamento.create({
			importo: importoTotale,
			data_ora_pagamento: dataPrenotazione.toISOString(),
		});

		await Ordine.addPagamento(id_pagamento, id_ordine);
		console.log(`🛎️ Ordine creato per ${username} (ID prenotazione: ${id_prenotazione})`);
	}
}

export default generatePrenotazioni;