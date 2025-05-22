import asporto from '../../Models/asporto';
import cliente, { ClienteRecord } from '../../Models/cliente';

import { faker } from '@faker-js/faker';

export async function generateAsporto(count: number): Promise<string> {
	try {
		const clienti = await cliente.findAll();
		const idClienti = clienti.map((c) => c.numero_carta);

		for (let i = 0; i < count; i++) {
			const indirizzo =
				faker.location.street() +
				' ' +
				faker.location.secondaryAddress();
			const data_ora_consegna = faker.date.anytime().toISOString();
			const ref_cliente = faker.helpers.arrayElement(idClienti);

			try {
				await asporto.create({
					indirizzo,
					data_ora_consegna,
					ref_cliente,
				});
				console.log(
					`🏍️  Abbiamo consegnato d'asporto in via ${indirizzo} ed in data ${data_ora_consegna}!`
				);
			} catch (err) {
				console.error(
					`🔫 In via ${indirizzo} abita un pazzo, quindi non abbiamo consegnato d'asporto! Causa di spavento: ${err}`
				);
				throw err;
			}
		}

		return '🏍️ Asporti generati con successo!';
	} catch (err) {
		console.error('🔫 Errore durante la generazione degli asporti:', err);
		throw err;
	}
}

export default generateAsporto;
