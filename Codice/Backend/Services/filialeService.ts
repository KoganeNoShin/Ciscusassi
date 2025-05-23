import Filiale, { FilialeInput, FilialeRecord } from '../Models/filiale';

class FilialeService {
	static async getAllFiliali(): Promise<FilialeRecord[] | null> {
		const filiali = await Filiale.findAll();
		return filiali || null;
	}

	static async addFiliale(input: FilialeRecord): Promise<number | null> {
		const filialeData: FilialeInput = {
			comune: input.comune,
			indirizzo: input.indirizzo,
			num_tavoli: input.num_tavoli,
			longitudine: input.longitudine,
			latitudine: input.latitudine,
			immagine: input.immagine,
		};

		return await Filiale.addFiliale(filialeData);
	}

	static async updateFiliale(input: FilialeInput, id: number): Promise<void> {
		const filialeData: FilialeInput = {
			comune: input.comune,
			indirizzo: input.indirizzo,
			num_tavoli: input.num_tavoli,
			longitudine: input.longitudine,
			latitudine: input.latitudine,
			immagine: input.immagine,
		};

		return await Filiale.updateFiliale(filialeData, id);
	}

	static async deleteFiliale(id: number): Promise<void> {
		return await Filiale.deleteFiliale(id);
	}
}

export default FilialeService;
