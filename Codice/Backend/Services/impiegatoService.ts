import Impiegato, { ImpiegatoData, ImpiegatoInput, ImpiegatoRecord } from '../Models/impiegato';

class ImpiegatoService {
    static async addImpiegato(input: ImpiegatoInput): Promise<number> {
        try {
            return await Impiegato.create(input);
        }catch (error) {
            console.error('❌ [ImpiegatoService] Errore durante l\'aggiunta dell\'impiegato:', error);
            throw error;
        }
    }

    static async updateImpiegato(input: ImpiegatoData, matricola: number): Promise<void> {
        try {
            await Impiegato.updateImpiegato(input, matricola);
        } catch (error) {
            console.error('❌ [ImpiegatoService] Errore durante l\'aggiornamento dell\'impiegato:', error);
            throw error;
        }
    }

    static async deleteImpiegato(matricola: number): Promise<void> {
        try {
            await Impiegato.deleteImpiegato(matricola);
        } catch (error) {
            console.error('❌ [ImpiegatoService] Errore durante l\'eliminazione dell\'impiegato:', error);
            throw error;
        }
    }

    static async getByFiliale(id_filiale: number): Promise<ImpiegatoRecord[] | null> {
        try {
            return await Impiegato.getByFiliale(id_filiale);
        } catch (error) {
            console.error('❌ [ImpiegatoService] Errore durante la selezione degli impiegato:', error);
            throw error;
        }
    }
}
export default ImpiegatoService;
