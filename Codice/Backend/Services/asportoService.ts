import Asporto, { AsportoInput } from "../Models/asporto";

class AsportoService {
    static async addAsporto(input: AsportoInput): Promise<number> {
        return await Asporto.create(input);
    }
}

export default AsportoService;