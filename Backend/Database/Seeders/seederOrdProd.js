const ord_prod = require('../../Models/ord_prod');
const ordine = require('../../Models/ordine');
const prodotto = require('../../Models/prodotto');

const { faker } = require('@faker-js/faker');

async function generateOrdProd() {
    try {
        const ordini = await ordine.findAll();
        const prodotti = await prodotto.findAll();

        const idOrdini = ordini.map(o => o.id_ordine);
        const idProdotti = prodotti.map(p => p.id_prodotto);

        for (const idOrdine of idOrdini) 
        {

            const numProdotti = faker.number.int({ min: 3, max: 8 });
  
            for (let j = 0; j < numProdotti; j++) {

                const ref_prodotto = faker.helpers.arrayElement(idProdotti);
                const is_romana = false;
                const stato = "CONSEGNATO";
  
                try
                {
                    await ord_prod.create({
                        ref_ordine: idOrdine,
                        ref_prodotto: ref_prodotto,
                        is_romana: is_romana,
                        stato: stato
                    });
                    console.log(`🧾 Prodotto ${ref_prodotto} aggiunto all'ordine ${idOrdine}`);
                }catch (err){
                    console.error(`❌ Errore nell'aggiunta di prodotto ${ref_prodotto} a ordine ${idOrdine}:`, err);
                }
            }
        }
    }
    catch (err)
    {
        console.error(`❌ Errore nell'aggiunta di prodotto ${ref_prodotto} a ordine ${idOrdine}:`, err);
    }        
}

module.exports = { generateOrdProd }