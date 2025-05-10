const prodotto = require('../../Models/prodotto');

const { faker } = require('@faker-js/faker');

const path = require('path'); // Modulo per gestire i percorsi
const axios = require('axios');
const fs = require('fs'); // Modulo per leggere il file

// Funzione per leggere il file JSON
async function readProdottiFromFile() {
    const filePath = path.join(__dirname, 'prodotti.json');
    
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const prodotti = JSON.parse(data);
        return prodotti;
    } catch (error) {
        console.error("Errore durante la lettura del file 'prodotti.json':", error);
        throw error;
    }
}

async function generateProdotto() 
{

    return new Promise(async (resolve, reject) => {

        let prodotti = await readProdottiFromFile();
        let prodottiPromises = [];      

        for (let i = 0; i < prodotti.length; i++) {
            
            let nome = prodotti[i].nome;
            let cognome = prodotti[i].cognome;
            let descrizione = prodotti[i].descrizione;
            let costo = faker.number.float({min: 8, max:14, fractionDigits: 2});
            let immagine = "data:image/jpeg;base64," + prodotti[i].immagine;
            let categoria = prodotti[i].categoria;
            let is_piatto_giorno = i === 0;

            let prodottoPromise = prodotto.create({nome: nome, cognome: cognome, descrizione: descrizione, costo: costo, immagine: immagine, categoria: categoria, is_piatto_giorno: is_piatto_giorno}).then( () => {
                console.log(`🍝 Piatto ${nome} di categoria ${categoria} al prezzo di ${costo}€ è stato aggiunto! ${is_piatto_giorno ? "È il piatto del giorno!" : ""}`);
            }).catch( (err) => {
                console.log(`♻️ Piatto ${nome} è andato a male! Causa di andata a male: ${err}`);
                throw err;
            });  

            prodottiPromises.push(prodottoPromise);
        }

        /*const categorie = ['CONTORNO', 'DOLCI', 'BEVANDE'];

        for (let i = 0; i < count; i++) {

            let nome = faker.food.dish();
            let descrizione = faker.food.description();
            let costo = faker.number.float({min: 8, max: 16, fractionDigits: 2});
            let immagine = await getBase64(faker.image.urlPicsumPhotos({width:256, height:256}));
            let categoria =  faker.helpers.arrayElement(categorie);
            let is_piatto_giorno = 0;

            let prodottoPromise = prodotto.create({nome: nome, descrizione: descrizione, costo: costo, immagine: immagine, categoria: categoria, is_piatto_giorno: is_piatto_giorno}).then( () => {
                console.log(`🍝 Piatto ${nome} di categoria ${categoria} al prezzo di ${costo}€ è stato aggiunto! ${is_piatto_giorno ? "È il piatto del giorno!" : ""}`);
            }).catch( (err) => {
                console.log(`♻️ Piatto ${nome} è andato a male! Causa di andata a male: ${err}`);
                throw err;
            }); 

            prodottoPromises.push(prodottoPromise);
        }*/

        await Promise.all(prodottiPromises)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject(err);
        });
    })       

    


}

generateProdotto(5)

module.exports = { generateProdotto }