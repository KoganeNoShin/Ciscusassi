import asp_prod from '../../Models/asp_prod';
import asporto from '../../Models/asporto';
import prodotto from '../../Models/prodotto';

const { faker } = require('@faker-js/faker');

export async function generateAspProd(): Promise<string> {

    try {
        const asporti = await asporto.findAll();
        const idAsporti = asporti.map(a => a.id_asporto);

        const prodotti = await prodotto.findAll();
        const idProdotti = prodotti.map(p => p.id_prodotto);


        for (let i = 0; i < asporti.length; i++) {

            for (let j = 0; j < faker.number.int({ min: 3, max: 8 }); j++) {
                let ref_asporto = idAsporti[i];
                let ref_prodotto = faker.helpers.arrayElement(idProdotti);

                try {
                    await asp_prod.create({ ref_asporto: ref_asporto, ref_prodotto: ref_prodotto });
                    console.log(`🛍️  Aggiunto il prodotto con ID ${ref_prodotto} nell'ordine di asporto con ID ${ref_asporto}!`);
                }
                catch (err) {
                    console.log(`❌ Impossibile aggiungere il prodotto con ID ${ref_prodotto} nell'ordine di asporto con ID ${ref_asporto}: ${err}`);
                    throw err;
                }
            }

        }

        return "🛍️ Popolati tutti i prodotti dei vari ordini d'asporto!";

    }
    catch (err) {
        console.log(`❌ Errore durante la generazione dei prodotti comprati negli ordini d'asporto:`, err);
        throw err;
    }

}

export default generateAspProd;