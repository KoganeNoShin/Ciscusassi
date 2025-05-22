import pagamento from '../../Models/pagamento';
import ordine from '../../Models/ordine';
import ord_prod from '../../Models/ord_prod';
import prodotto from '../../Models/prodotto';

import { faker } from '@faker-js/faker';

async function generatePagamento() {
	try {
		const ordini = await ordine.findAll();

		for (const o of ordini) {
			let importo = 0;

			const ordProds = await ord_prod.findByRefOrdine(o.id_ordine);

			for (const op of ordProds) {
				const p = await prodotto.findById(op.ref_prodotto);
				importo += p.costo;
			}

			importo = Math.round(importo * 10) / 10;

			try {
				await pagamento.create({
					importo: importo,
					data_ora_pagamento: new Date(
						Date.parse(o.data_ora_ordinazione) +
							faker.number.int({ min: 70, max: 120 }) * 60 * 1000
					).toISOString(),
				});
				console.log(
					`💳 L'ordine con id ${o.id_ordine} ha avuto un importo totale di ${importo}`
				);
			} catch (err) {
				console.error(
					`✂️ L'ordine con id ${o.id_ordine} non aveva abbastanza soldi per pagare! Causa di errore: ${err} `
				);
				throw err;
			}
		}
		return '💳 Pagamenti generati con successo!';
	} catch (err) {
		console.error('✂️ Errore durante la generazione dei pagamenti:', err);
		throw err;
	}
}

export default generatePagamento;
