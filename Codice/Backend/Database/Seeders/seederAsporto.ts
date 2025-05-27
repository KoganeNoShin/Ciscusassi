import asporto from '../../Models/asporto';
import cliente from '../../Models/cliente';
import pagamento from '../../Models/pagamento';
import prodotto from '../../Models/prodotto';
import aspProd from '../../Models/asp_prod';
import filiale from '../../Models/filiale';

import { faker } from '@faker-js/faker';

export async function generateAsporto(count: number): Promise<string> {
	try {
		const clienti = await cliente.findAll();
		if (!clienti || clienti.length === 0) throw new Error("Nessun cliente trovato");
		const idClienti = clienti.map((c) => c.numero_carta);

		const prodotti = await prodotto.getAll();
		if (!prodotti || prodotti.length === 0) throw new Error("Nessun prodotto trovato");
		const idProdotti = prodotti.map((p) => p.id_prodotto);

		const filiali = await filiale.getAll();
		if (!filiali || filiali.length === 0) throw new Error("Nessuna filiale trovata");
		const idFiliali = filiali.map((f) => f.id_filiale);

		for (let i = 0; i < count; i++) {
			const indirizzo = faker.location.street() + ' ' + faker.location.secondaryAddress();
			const data_ora_consegna = faker.date.anytime().toISOString();
			const ref_cliente = faker.helpers.arrayElement(idClienti);

			const importo = faker.number.float({ min: 8, max: 50, fractionDigits: 2 });
			const data_ora_pagamento = faker.date.recent().toISOString();
			const ref_pagamento = await pagamento.create({ importo, data_ora_pagamento });

			if (!ref_pagamento) {
				throw new Error("Errore durante la creazione del pagamento");
			}

			const ref_filiale = faker.helpers.arrayElement(idFiliali);

			try {
				const id_asporto = await asporto.create({
					indirizzo,
					data_ora_consegna,
					ref_cliente,
					ref_pagamento,
					ref_filiale,
				});

				console.log(`🏍️  Abbiamo consegnato d'asporto in via ${indirizzo} ed in data ${data_ora_consegna}!`);

				const nProdotti = faker.number.int({ min: 3, max: 8 });
				for (let j = 0; j < nProdotti; j++) {
					const ref_prodotto = faker.helpers.arrayElement(idProdotti);
					await aspProd.create({ ref_asporto: id_asporto, ref_prodotto });
					console.log(`🛍️  Prodotto ${ref_prodotto} associato all'asporto ${id_asporto}`);
				}
			} catch (err) {
				console.error(
					`🔫 In via ${indirizzo} abita un pazzo, quindi non abbiamo consegnato d'asporto! Causa di spavento: ${err}`
				);
				throw err;
			}
		}

		return '✅ Asporti e prodotti associati generati con successo!';
	} catch (err) {
		console.error('🔫 Errore durante la generazione degli asporti:', err);
		throw err;
	}
}

export default generateAsporto;
