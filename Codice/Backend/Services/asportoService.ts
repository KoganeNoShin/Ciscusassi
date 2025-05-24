import Asporto, { AsportoInput } from "../Models/asporto";

class AsportoService {
    static async addAsporto(input: AsportoInput): Promise<number> {
        return await Asporto.create(input);
    }

    static async deleteAsporto(id: number): Promise<void> {
        return await Asporto.deleteAsporto(id);
    }

    static async updateAsporto(id: number, input: AsportoInput): Promise<void> {
        return await Asporto.updateAsporto(id, input);
    }

    static async getAllAsporti(): Promise<Asporto[] | null> {
        return await Asporto.findAll();
    }
}

export default AsportoService;