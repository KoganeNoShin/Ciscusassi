import Filiale, { FilialeRecord } from '../Models/filiale';

class FilialeService {
	static async getAllFiliali(): Promise<FilialeRecord[] | null> {
		const filiali = await Filiale.findAll();
		return filiali || null;
	}
}

export default FilialeService;
