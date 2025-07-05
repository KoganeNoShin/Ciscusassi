import Torretta from "../Models/torretta";

class TorrettaService {
    /**
     * Recupera una torretta dal database in base all'ID specificato.
     * @param id_torretta ID numerico della torretta da cercare
     * @returns La torretta trovata o null se non esiste
     * @throws Errore se si verifica un problema durante l'accesso al database
     */
    static async getTorrettaByID(id_torretta: number): Promise<any> {
        try {
            return Torretta.getById(id_torretta);
        } catch (error) {
            console.error('❌ [TorrettaService] Errore durante il recupero della torretta:', error);
            throw error;
        }
    }
}

export default TorrettaService;