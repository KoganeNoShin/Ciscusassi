import Filiale from '../../Models/filiale';
import Cliente, { ClienteRecord } from '../../Models/cliente';
import Torretta from '../../Models/torretta';
import Prenotazione from '../../Models/prenotazione';
import Ordine from '../../Models/ordine';
import OrdProd from '../../Models/ord_prod';
import Prodotto from '../../Models/prodotto';
import Pagamento from '../../Models/pagamento';
import { faker } from '@faker-js/faker';
import PrenotazioneService from '../../Services/prenotazioneService';

const ORARI_VALIDI = ['12:00', '13:30', '19:30', '21:00'];

export async function generatePrenotazioni(count: number): Promise<string> {
	try {
		const filiali = await Filiale.getAll();
		const clienti: ClienteRecord[] = await Cliente.getAll();
		if (!clienti.length) throw new Error('Nessun cliente trovato');

		for (const filiale of filiali) {
			for (let i = 0; i < count; i++) {
				const dataPren = getDataPrenotazione('passato');
				const dataPrenFormattata = formatDateTime(dataPren);
				const torretteLibere = await Torretta.getTorretteLibere(filiale.id_filiale, dataPrenFormattata);

				if (!torretteLibere.length) {
					console.warn(`⚠️ Nessuna torretta libera per ${filiale.indirizzo} alle ${dataPrenFormattata}`);
					continue;
				}

				const numero_persone = faker.number.int({ min: 1, max: 8 });
				const clientePrenotazione = faker.helpers.arrayElement(clienti);
				const torrettaSelezionata = faker.helpers.arrayElement(torretteLibere);

				const id_prenotazione = await Prenotazione.create({
					numero_persone,
					data_ora_prenotazione: dataPrenFormattata,
					ref_cliente: clientePrenotazione.numero_carta,
					ref_torretta: torrettaSelezionata.id_torretta,
				});
				await PrenotazioneService.confermaPrenotazione(id_prenotazione);

				console.log(`✅ Prenotazione PASSATA creata con ID ${id_prenotazione}`);

				await generateOrdini(clientePrenotazione, id_prenotazione, dataPren, numero_persone, clienti);
			}
		}

		return 'Prenotazioni passate generate con successo';
	} catch (err) {
		console.error(`❌ Errore nella generazione prenotazioni:`, err);
		throw err;
	}
}

function getDataPrenotazione(tipo: 'passato'): Date {
	const data = new Date();
	const [hh, mm] = faker.helpers.arrayElement(ORARI_VALIDI).split(':').map(Number);
	data.setHours(hh, mm, 0, 0);

	// Solo prenotazioni passate tra 30 giorni e 2 anni fa
	data.setDate(data.getDate() - faker.number.int({ min: 30, max: 730 }));

	return data;
}

function formatDateTime(date: Date): string {
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');
	const hh = String(date.getHours()).padStart(2, '0');
	const min = String(date.getMinutes()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
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

		const ordProdInput = Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => {
			const prodotto = faker.helpers.arrayElement(prodotti);
			return {
				ref_ordine: id_ordine,
				ref_prodotto: prodotto.id_prodotto,
				is_romana: false,
				stato: 'consegnato',
			};
		});

		await Promise.all(ordProdInput.map(op => OrdProd.create(op)));

		const importoTotale = ordProdInput.reduce((sum, op) => {
			const prodotto = prodotti.find(p => p.id_prodotto === op.ref_prodotto)!;
			return sum + prodotto.costo;
		}, 0);

		const id_pagamento = await Pagamento.create({
			importo: importoTotale,
			data_ora_pagamento: formatDateTime(dataPrenotazione),
		});

		await Ordine.addPagamento(id_pagamento, id_ordine);
		console.log(`🛎️ Ordine creato per ${username} (ID prenotazione: ${id_prenotazione})`);
	}
}

export default generatePrenotazioni;