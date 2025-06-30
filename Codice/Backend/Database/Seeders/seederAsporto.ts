import asporto from '../../Models/asporto';
import aspProd from '../../Models/asp_prod';
import pagamento from '../../Models/pagamento';
import cliente from '../../Models/cliente';
import prodotto from '../../Models/prodotto';
import filiale from '../../Models/filiale';
import { faker } from '@faker-js/faker';
import { format } from 'date-fns';

export async function generateAsporto(count: number): Promise<string> {
	try {
		const clienti = await cliente.getAll();
		if (!clienti || clienti.length === 0) throw new Error("Nessun cliente trovato");
		const idClienti = clienti.map((c) => c.numero_carta);

		const prodotti = await prodotto.getAll();
		if (!prodotti || prodotti.length === 0) throw new Error("Nessun prodotto trovato");
		const idProdotti = prodotti.map((p) => p.id_prodotto);

		const filiali = await filiale.getAll();
		if (!filiali || filiali.length === 0) throw new Error("Nessuna filiale trovata");
		const idFiliali = filiali.map((f) => f.id_filiale);

		for (let a = 2023; a <= 2025; a++) {
			for (let m = 0; m < 12; m++) {
				for (let i = 0; i < count; i++) {
					let rawDate: Date;

					if (a < 2025) {
						rawDate = new Date(
							a,
							m,
							faker.number.int({ min: 1, max: 28 }),
							faker.number.int({ min: 0, max: 23 }),
							faker.number.int({ min: 0, max: 59 }),
							0
						);
					} else {
						rawDate = new Date(
							a,
							faker.number.int({ min: 0, max: 5 }),
							faker.number.int({ min: 1, max: 28 }),
							faker.number.int({ min: 0, max: 23 }),
							faker.number.int({ min: 0, max: 59 }),
							0
						);
					}

					const data_ora_consegna = format(rawDate, 'yyyy-MM-dd HH:mm');
					const indirizzo = faker.location.street() + ' ' + faker.location.secondaryAddress();
					const ref_cliente = faker.helpers.arrayElement(idClienti);
					const importo = faker.number.float({ min: 8, max: 50, fractionDigits: 2 });
					const data_ora_pagamento = data_ora_consegna;
					const ref_pagamento = await pagamento.create({ importo, data_ora_pagamento });

					if (!ref_pagamento) throw new Error("Errore durante la creazione del pagamento");

					const ref_filiale = faker.helpers.arrayElement(idFiliali);

					try {
						const id_asporto = await asporto.create({
							indirizzo,
							data_ora_consegna,
							ref_cliente,
							ref_pagamento,
							ref_filiale
						});

						console.log(`🏍️  Abbiamo consegnato d'asporto in via ${indirizzo} ed in data ${data_ora_consegna}!`);

						const nProdotti = faker.number.int({ min: 3, max: 8 });
						const prodottiPromises = Array.from({ length: nProdotti }, async () => {
							const ref_prodotto = faker.helpers.arrayElement(idProdotti);
							await aspProd.create({ ref_asporto: id_asporto, ref_prodotto });
							console.log(`🛍️  Prodotto ${ref_prodotto} associato all'asporto ${id_asporto}`);
						});

						await Promise.all(prodottiPromises);
					} catch (err) {
						console.error(`🔫 In via ${indirizzo} abita un pazzo, quindi non abbiamo consegnato d'asporto! Causa di spavento: ${err}`);
						throw err;
					}
				}
			}
		}

		return '✅ Asporti e prodotti associati generati con successo!';
	} catch (err) {
		console.error('🔫 Errore durante la generazione degli asporti:', err);
		throw err;
	}
}

export default generateAsporto;