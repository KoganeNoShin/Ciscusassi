const asp_prod = require('../../Models/asp_prod');
const asporto = require('../../Models/asporto');
const prodotto = require('../../Models/prodotto');

const { faker } = require('@faker-js/faker');

async function generateAspProd() 
{

    return new Promise(async (resolve, reject) => {

        let aspProdPromises = [];

        let idAsporti = [];
        let idProdotti = [];

        await asporto.findAll().then( (asporti) => {
            asporti.forEach(a => {
                idAsporti.push(a.id_asporto);
            });
        }).catch((err) => {
            throw err;
        });

        await prodotto.findAll().then( (prodotti) => {
            prodotti.forEach(p => {
                idProdotti.push(p.id_prodotto);
            });
        }).catch((err) => {
            throw err;
        });

        for (let i = 0; i < idAsporti.length; i++) 
        {
            
            for (let j = 0; j < faker.number.int({min:3, max:8}); j++) {
                let ref_asporto = idAsporti[i];
                let ref_prodotto = faker.helpers.arrayElement(idProdotti);

                let aspProdPromise = asp_prod.create({ref_asporto: ref_asporto, ref_prodotto: ref_prodotto}).then( () => {
                    console.log(`🛍️  Aggiunto il prodotto con ID ${ref_prodotto} nell'ordine di asporto con ID ${ref_asporto}!`);
                }).catch( (err) => {
                    console.log(`❌ Impossibile aggiungere il prodotto con ID ${ref_prodotto} nell'ordine di asporto con ID ${ref_asporto}: ${err}`);
                    throw err;
                });   

                aspProdPromises.push(aspProdPromise);
            }

        }

        // Usiamo promise all per assicurarci che tutti gli aspProd siano stati creati!

        Promise.all(aspProdPromises)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject(err);
        });        

    });


}

module.exports = { generateAspProd }