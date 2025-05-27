import torretta from '../../Models/torretta';
import filiale from '../../Models/filiale';

export async function generateTorretta(): Promise<string> {
	try {
		const filiali = await filiale.getAll();

		for (let i = 0; i < filiali.length; i++) {
			const nTorrette = Math.ceil(filiali[i].num_tavoli / 3);
			let f = filiali[i];

			for (let i = 0; i < nTorrette; i++) {
				try {
					await torretta.create({ ref_filiale: f.id_filiale });
					console.log(
						`🏰 Torretta aggiunta alla filiale in via ${f.indirizzo}!`
					);
				} catch (err) {
					console.log(
						`🧨 Torretta esplosa alla filiale in via ${f.indirizzo}!. Causa di esplosione: ${err}`
					);
					throw err;
				}
			}
		}

		return `🏰 Torrette generate con successo!`;
	} catch (err) {
		console.log(`🧨 Errore durante la generazione delle torrette ${err}`);
		throw err;
	}
}

export default generateTorretta;
