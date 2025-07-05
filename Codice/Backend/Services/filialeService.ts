import Filiale, { FilialeRecord } from '../Models/filiale';
import Torretta, { TorrettaInput } from '../Models/torretta';

class FilialeService {
	/**
	 * Aggiunge una nuova filiale al database.
	 * - Dopo la creazione della filiale, vengono generate automaticamente
	 *   tutte le torrette associate in base al numero di tavoli.
	 * @param data Dati completi della filiale da inserire.
	 * @returns L'ID della nuova filiale creata.
	 */
	static async addFiliale(data: FilialeRecord): Promise<number | null> {
		try {
			const idFiliale = await Filiale.create(data);

			// Crea tante torrette quante specificate da num_tavoli
			const torrettaInput: TorrettaInput = { ref_filiale: idFiliale };
			for (let i = 0; i < data.num_tavoli; i++) {
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

	/**
	 * Aggiorna i dati di una filiale esistente.
	 * - Se il nuovo numero di tavoli è maggiore del precedente,
	 *   crea nuove torrette per i tavoli aggiuntivi.
	 * @param data Nuovi dati della filiale.
	 * @param id_filiale ID della filiale da aggiornare.
	 */
	static async updateFiliale(data: FilialeRecord, id_filiale: number): Promise<void> {
		try {
			// Recupera i dati attuali per confrontare il numero di tavoli
			const dataFilialeOld = await Filiale.getById(id_filiale);

			await Filiale.updateFiliale(data, id_filiale);

			// Se sono stati aggiunti tavoli, crea nuove torrette
			if (dataFilialeOld && data.num_tavoli > dataFilialeOld.num_tavoli) {
				const torrettaInput: TorrettaInput = { ref_filiale: id_filiale };
				const differenzaTavoli = data.num_tavoli - dataFilialeOld.num_tavoli;

				for (let i = 0; i < differenzaTavoli; i++) {
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

	/**
	 * Elimina una filiale dato il suo ID.
	 * @param id ID della filiale da rimuovere.
	 */
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

	/**
	 * Recupera tutte le filiali presenti nel database.
	 * @returns Array di oggetti FilialeRecord oppure null.
	 */
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