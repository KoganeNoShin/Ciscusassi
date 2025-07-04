import Filiale, { FilialeRecord } from '../Models/filiale';
import Torretta, { TorrettaInput } from '../Models/torretta';

class FilialeService {
	static async addFiliale(data: FilialeRecord): Promise<number | null> {
		try {
			const idFiliale = await Filiale.create(data);
			
			const torrettaInput: TorrettaInput = {ref_filiale: idFiliale}
			for(let i = 0; i < data.num_tavoli; i++) {
				await Torretta.create(torrettaInput);
			}

			return idFiliale;
		} catch (error) {
			console.error(
				"❌ [FilialeService] Errore durante l'aggiunta della Filiale:",
				error
			);
			throw error;
		}
	}

	static async updateFiliale(data: FilialeRecord, id_filiale: number): Promise<void> {
		try {
			const dataFilialeOld = await Filiale.getById(id_filiale);

			await Filiale.updateFiliale(data, id_filiale);

			if(dataFilialeOld && data.num_tavoli > dataFilialeOld.num_tavoli) {
				const torrettaInput: TorrettaInput = {ref_filiale: id_filiale}
				const differenzaTavoli = data.num_tavoli - dataFilialeOld.num_tavoli;
				for(let i = 0; i < differenzaTavoli; i++) {
					await Torretta.create(torrettaInput);
				}
			}
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
