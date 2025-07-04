import Filiale, { FilialeRecord } from '../Models/filiale';

class FilialeService {
	static async addFiliale(data: FilialeRecord): Promise<number | null> {
		try {
			return await Filiale.create(data);
		} catch (error) {
			console.error(
				"❌ [FilialeService] Errore durante l'aggiunta della Filiale:",
				error
			);
			throw error;
		}
	}

	static async updateFiliale(
		data: FilialeRecord,
		id_filiale: number
	): Promise<void> {
		try {
			return await Filiale.updateFiliale(data, id_filiale);
		} catch (error) {
			console.error(
				'❌ [FilialeService] Errore durante la modifica della Filiale:',
				error
			);
			throw error;
		}
	}

	static async deleteFiliale(id: number): Promise<void> {
		try {
			await Filiale.deleteFiliale(id);
		} catch (error) {
			console.error(
				"❌ [FilialeService] Errore durante l'eliminazione della Filiale:",
				error
			);
			throw error;
		}
	}

	static async getAllFiliali(): Promise<FilialeRecord[] | null> {
		try {
			return await Filiale.getAll();
		} catch (error) {
			console.error(
				'❌ [FilialeService] Errore durante il recupero delle Filiali:',
				error
			);
			throw error;
		}
	}
}

export default FilialeService;
