import Filiale, { FilialeInput, FilialeRecord } from '../Models/filiale';

class FilialeService {
	private static validate(input: FilialeInput): void {
		if (!input.comune || input.comune.trim() === '') {
			throw new Error('Il campo "comune" è obbligatorio.');
		}

		if (!input.indirizzo || input.indirizzo.trim() === '') {
			throw new Error('Il campo "indirizzo" è obbligatorio.');
		}

		if (!Number.isInteger(input.num_tavoli) || input.num_tavoli <= 0) {
			throw new Error('Il numero di tavoli deve essere un intero positivo.');
		}

		const lon = parseFloat(input.longitudine);
		if (isNaN(lon) || lon < -180 || lon > 180) {
			throw new Error('La longitudine deve essere un numero valido tra -180 e 180.');
		}

		const lat = parseFloat(input.latitudine);
		if (isNaN(lat) || lat < -90 || lat > 90) {
			throw new Error('La latitudine deve essere un numero valido tra -90 e 90.');
		}

		if (!input.immagine || !input.immagine.startsWith('data:image/')) {
			throw new Error('L\'immagine deve essere in formato base64 valido (data:image/...).');
		}
	}
	

	static async addFiliale(data: FilialeRecord): Promise<number | null> {
		try {
			this.validate(data);
			return await Filiale.create(data);
		} catch(error) {
			console.error('❌ [FilialeService] Errore durante l\'aggiunta della Filiale:', error);
			throw error;
		}
	}

	static async updateFiliale(data: FilialeInput, id: number): Promise<void> {
		try {
			this.validate(data);
			return await Filiale.updateFiliale(data, id);
		} catch(error) {
			console.error('❌ [FilialeService] Errore durante la modifica della Filiale:', error);
			throw error;
		}
	}

	static async deleteFiliale(id: number): Promise<void> {
		try{
			await Filiale.deleteFiliale(id);
		} catch (error) {
			console.error('❌ [FilialeService] Errore durante l\'eliminazione della Filiale:', error);
			throw error;
		}
	}

	static async getAllFiliali(): Promise<FilialeRecord[] | null> {
		try {
			return await Filiale.getAll();
		} catch (error) {
			console.error('❌ [FilialeService] Errore durante il recupero delle Filiali:', error);
			throw error;
		}
	}
}

export default FilialeService;