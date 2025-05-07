const asporto = require('../../Models/asporto');
const cliente = require('../../Models/cliente');

const { faker } = require('@faker-js/faker');

async function generateAsporto(count) 
{

    return new Promise(async (resolve, reject) => {

        let asportiPromises = [];
        let idClienti = [];

        await cliente.findAll().then( (clienti) => {
            clienti.forEach(c => {
                idClienti.push(c.numero_carta);
            });
        }).catch((err) => {
            throw err;
        });

        for (let i = 0; i < count; i++) 
        {
            let indirizzo = faker.location.street(true) + " " +  faker.location.secondaryAddress();
            let data_ora_consegna = faker.date.anytime().toISOString();
            let ref_cliente = faker.helpers.arrayElement(idClienti);

            let asportoPromise = asporto.create({ indirizzo: indirizzo, data_ora_consegna: data_ora_consegna, ref_cliente: ref_cliente }).then( () => {
                console.log(`🏍️  Abbiamo consegnato d'asporto in via ${indirizzo} ed in data ${data_ora_consegna}!`);
            }).catch( (err) => {
                console.log(`🔫 In via ${indirizzo} abita un pazzo, quindi non abbiamo consegnato d'asporto! Causa di spavento: ${err}`);
                throw err;
            });   

            asportiPromises.push(asportoPromise);
        }

        // Usiamo promise all per assicurarci che tutti gli asporti siano stati creati!

        Promise.all(asportiPromises)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject(err);
        });        

    });


}

module.exports = { generateAsporto }