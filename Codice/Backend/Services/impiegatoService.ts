import Impiegato, { ImpiegatoRecord } from '../Models/impiegato';

class ImpiegatoService {
    static async getAllImpiegati(): Promise<ImpiegatoRecord[] | null> {
        const impiegati = await Impiegato.findAll();
        return impiegati || null;
    }
}

export default ImpiegatoService;
