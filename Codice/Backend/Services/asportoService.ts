import Asporto, { AsportoInput } from "../Models/asporto";

class AsportoService {
    static async getAllAsporti(): Promise<Asporto[] | null> {
        const asporti = await Asporto.findAll();
        return asporti || null;
    }

    static async addAsporto(input: AsportoInput): Promise<number> {
        return await Asporto.create(input);
    }

    static async deleteAsporto(id: number): Promise<void> {
        return await Asporto.deleteAsporto(id);
    }

    static async updateAsporto(id: number, input: AsportoInput): Promise<void> {
        return await Asporto.updateAsporto(id, input);
    }
}

export default AsportoService;