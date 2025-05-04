const prodotto = require('../../Models/prodotto');

const { faker } = require('@faker-js/faker');

const axios = require('axios');

async function getBase64(imageUrl)
{
    try {
        // Scarica l'immagine
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

        // Converte l'immagine in Base64
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        
        // Usa il prefisso di tipo immagine per renderla valida come dati Base64
        const base64ImageWithPrefix = `data:image/jpeg;base64,${base64Image}`;

        return base64ImageWithPrefix;
    } catch (error) 
    {
        console.error("Errore durante la conversione dell'immagine:", error);
        throw error;
    }
}

async function generateProdotto(count) 
{

    return new Promise(async (resolve, reject) => {

        let prodottoPromises = [];      
        const categorie = ['PRIMO', 'SECONDO', 'CONTORNO', 'FRUTTA', 'BEVANDE'];

        for (let i = 0; i < count; i++) {

            let nome = faker.food.dish();
            let descrizione = faker.food.description();
            let costo = faker.number.float({min: 8, max: 16, fractionDigits: 2});
            let immagine = await getBase64(faker.image.urlPicsumPhotos({width:256, height:256}));
            let categoria =  faker.helpers.arrayElement(categorie);
            let is_piatto_giorno = i === 0;

            let prodottoPromise = prodotto.create({nome: nome, descrizione: descrizione, costo: costo, immagine: immagine, categoria: categoria, is_piatto_giorno: is_piatto_giorno}).then( () => {
                console.log(`🍝 Piatto ${nome} di categoria ${categoria} al prezzo di ${costo}€ è stato aggiunto! ${is_piatto_giorno ? "È il piatto del giorno!" : ""}`);
            }).catch( (err) => {
                console.log(`♻️ Piatto ${nome} è andato a male! Causa di andata a male: ${err}`);
                throw err;
            }); 

            prodottoPromises.push(prodottoPromise);
        }

        await Promise.all(prodottoPromises)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject(err);
        });
    })       

    


}

module.exports = { generateProdotto }