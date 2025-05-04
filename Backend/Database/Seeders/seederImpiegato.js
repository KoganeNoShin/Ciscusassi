const filiale = require('../../Models/filiale');
const impiegato = require('../../Models/impiegato');

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

async function generateImpiegato() 
{

    return new Promise(async (resolve, reject) => {

        let impiegatiPromises = [];
        
        filiale.findAll().then( (res) => {
            res.forEach(async filiale => {
                
                // --- Amministratore ---

                let admin_sex = faker.person.sex();
                let admin_nome = faker.person.firstName({sex: admin_sex});
                let admin_cognome = faker.person.lastName({sex: admin_sex});
                let admin_email = faker.internet.email({firstName: admin_nome, lastName: admin_cognome});
                let admin_data_nascita = faker.date.birthdate().toISOString();
                let admin_password = "QuestaPasswordEMoltoSicura!";
                let admin_imageBase64 = await getBase64(faker.image.personPortrait( { sex: admin_sex, size: 512 } ));
                let admin_ruolo = "Amministratore";
    
                let adminPromise = impiegato.create({nome: admin_nome, cognome: admin_cognome, ruolo: admin_ruolo, foto: admin_imageBase64, password: admin_password, email: admin_email, data_nascita: admin_data_nascita, ref_filiale: filiale.id_filiale}).then( () => {
                    console.log(`💼 ${admin_nome} ${admin_cognome} è stato assunto in ${filiale.indirizzo} come ${admin_ruolo}!`);
                }).catch( (err) => {
                    console.log(`🤡 ${admin_nome} ${admin_cognome} è stato licenziato! Causa di licenziamento: ${err}`);
                    reject(err);
                });

                impiegatiPromises.push(adminPromise);

                // --- CHEF ---

                let chef_sex = faker.person.sex();
                let chef_nome = faker.person.firstName({sex: chef_sex});
                let chef_cognome = faker.person.lastName({sex: chef_sex});
                let chef_email = faker.internet.email({firstName: chef_nome, lastName: chef_cognome});
                let chef_data_nascita = faker.date.birthdate().toISOString();
                let chef_password = "QuestaPasswordEMoltoSicura!";
                let chef_imageBase64 = await getBase64(faker.image.personPortrait( { sex: chef_sex, size: 512 } ));
                let chef_ruolo = "Chef";

                let chefPromise = impiegato.create({nome: chef_nome, cognome: chef_cognome, ruolo: chef_ruolo, foto: chef_imageBase64, password: chef_password, email: chef_email, data_nascita: chef_data_nascita, ref_filiale: filiale.id_filiale}).then( () => {
                    console.log(`🥩 ${chef_nome} ${chef_cognome} è stato assunto in ${filiale.indirizzo} come ${chef_ruolo}!`);
                }).catch( (err) => {
                    console.log(`🤡 ${chef_nome} ${chef_cognome} è stato licenziato! Causa di licenziamento: ${err}`);
                    reject(err);
                });

                impiegatiPromises.push(chefPromise);

                // --- CAMERIERI ---

                let nCamerieri = Math.floor(filiale.num_tavoli/4);

                for (let i = 0; i < nCamerieri; i++) 
                {
                    let waiter_sex = faker.person.sex();
                    let waiter_nome = faker.person.firstName({sex: waiter_sex});
                    let waiter_cognome = faker.person.lastName({sex: waiter_sex});
                    let waiter_email = faker.internet.email({firstName: waiter_nome, lastName: waiter_cognome});
                    let waiter_data_nascita = faker.date.birthdate().toISOString();
                    let waiter_password = "QuestaPasswordEMoltoSicura!";
                    let waiter_imageBase64 = await getBase64(faker.image.personPortrait( { sex: waiter_sex, size: 512 } ));
                    let waiter_ruolo = "Cameriere";

                    let impiegatoPromise = impiegato.create({nome: waiter_nome, cognome: waiter_cognome, ruolo: waiter_ruolo, foto: waiter_imageBase64, password: waiter_password, email: waiter_email, data_nascita: waiter_data_nascita, ref_filiale: filiale.id_filiale }).then( () => {
                        console.log(`🍽️  ${waiter_nome} ${waiter_cognome} è stato assunto in ${filiale.indirizzo} come ${waiter_ruolo}!`);
                    }).catch( (err) => {
                        console.log(`🤡 ${waiter_nome} ${waiter_cognome} è stato licenziato! Causa di licenziamento: ${err}`);
                        reject(err);
                    }); 

                    impiegatiPromises.push(impiegatoPromise);

                }
            });

        }).catch((err) =>{
            console.error(err);
            reject(err);
        });        

        Promise.all(impiegatiPromises)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject(err);
        });
    });


}

module.exports = { generateImpiegato }