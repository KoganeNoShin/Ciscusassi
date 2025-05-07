const cliente = require('../../Models/cliente');

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

async function generateCliente(count) 
{

    return new Promise(async (resolve, reject) => {

        let clientiPromises = [];

        for (let i = 0; i < count; i++) 
        {
            let sex = faker.person.sex();
            let nome = faker.person.firstName({sex: sex});
            let cognome = faker.person.lastName({sex: sex});
            let email = faker.internet.email( { firstName: nome, lastName: cognome } );
            let data_nascita = faker.date.birthdate().toISOString();
            let password = "QuestaPasswordEMoltoSicura!";
            let punti = faker.number.int( { min: 0, max: 1000000 } );
            let imageBase64 = await getBase64(faker.image.personPortrait( { sex: sex, size: 512 } ));            

            let clientePromise = cliente.create({ nome: nome, cognome: cognome, email: email, password: password, punti: punti, data_nascita: data_nascita, image: imageBase64}).then( () => {
                console.log(`👱 ${nome} ${cognome} è diventato nostro cliente!`);
            }).catch( (err) => {
                console.log(`💀 ${nome} ${cognome} ci ha lasciato prematuramente. Causa di morte: ${err}`);
                throw err;
            });   

            clientiPromises.push(clientePromise);
        }

        // Usiamo promise all per assicurarci che tutti gli utenti siano stati create!

        Promise.all(clientiPromises)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject(err);
        });

    });


}

module.exports = { generateCliente }