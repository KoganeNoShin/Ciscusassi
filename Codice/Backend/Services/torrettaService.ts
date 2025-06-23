import Torretta from "../Models/torretta";

class TorrettaService {
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