// Valori segreti (Username, password)
// Bisogna avere un file rinominato "arduino_secrets.h" che segue il modello dell'example.
// Quel file non verrà condiviso con github, in modo tale che le credenziali rimangano segrete.
#include "arduino_secrets.h"

// Lib lettore
#include <SPI.h>
#include <MFRC522.h> // MFRC522 by Github Community

// Lib wifi
#include "WiFi.h"
#include "esp_wpa2.h"

// Lib http
#include <HTTPClient.h> // Basilare con Esp32

// Lib Oled
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h> // Adafruit SSD1306 by Adafruit (Con dipendenze)

#include <ArduinoJson.h> // Libreria parsing json

// Credenziali wifi
#define WIFI_SSID SECRET_SSID                   // Nome del WiFi
#define WIFI_IDENTITY SECRET_USERNAME           // Username in caso di EAP
#define WIFI_PASSWORD SECRET_PASSWORD           // Password del WIFI
#define WIFI_USERNAME SECRET_USERNAME           // Altro username in caso di EAP
#define IS_EAP SECRET_IS_EAP                    // Se siamo collegati ad una rete EAP
#define OTP_ROUTE SECRET_OTP                    // La rotta esposta dal backend per l'OTP
#define TOKEN_HEADER_NAME SECRET_HEADER_NAME    // Nome dell'header di autenticazione
#define TOKEN_HEADER_VALUE SECRET_HEADER_VALUE  // Valore dell'header di autenticazione

// Rotte
const char *serverAddressOTP = OTP_ROUTE;
WiFiClient wifiClient;

// Codici di stampa per la funzione stampaOled()
#define CONNESSIONE_IN_CORSO 1
#define CONNESSIONE_NON_RIUSCITA 2
#define CONNESSIONE_RIUSCITA 3
#define RICHIESTA_IN_CORSO 4
#define VISUALIZZA_OTP 5
#define VISUALIZZA_PRENOTAZIONE_NULLA 6
#define VISUALIZZA_ERRORE 13 // C'è stato un errore nella richiesta http

#define BUZZER 4 // Buzzer Pin

// Impostazione schermo
#define SCREEN_WIDTH 128    // OLED display width, in pixels
#define SCREEN_HEIGHT 64    // OLED display height, in pixels
#define OLED_RESET -1       // Reset pin # (or -1 if sharing Arduino reset pin)
#define SCREEN_ADDRESS 0x3C // See datasheet for Address; 0x3D for 128x64, 0x3C for 128x32

// Creazione "oggetto" display
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

String otp = ""; // Il valore dell'OTP

int foundOneTime = 0; // Se abbiamo preso l'otp almeno una volta

/*
    Quello che succede appena la board si accende
 */
void setup()
{
    Wire.begin(21, 22);   // SDA, SCL
    Serial.begin(115200); // Inizializziamo le comunicazioni seriali ad un baud-rate di 115200
    
    delay(1000);
    Serial.println("Setup");

    pinMode(BUZZER, OUTPUT); // Settiamo il pin di buzzer come output

    // Se il display non è stato inizializzato correttamente
    if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS))
    {
        Serial.println("Allocazione dello schermo OLED fallita!");

        tone(BUZZER, 500, 5000); // Il suono della morte

        while (true); // Blocchiamo tutto
    }

    display.clearDisplay(); // Cancelliamo lo schermo
    display.display(); // Visualizziamo lo schermo cancellato    
}

/*
    Funzione che viene richiamata infinitamente dopo che setup ha finito
 */
void loop()
{
    // Se non siamo connessi allora blocca tutto
    if (WiFi.status() != WL_CONNECTED)
    {
        connettiWifi(); // Ci connettiamo al wifi

        delay(2000);

        if(WiFi.status() != WL_CONNECTED)
        {
            Serial.println("Connessione WiFi mancante, riprovo a connettermi...");
            stampaoled(CONNESSIONE_NON_RIUSCITA);
            tone(BUZZER, 500, 2000); // Il suono della morte
        }

        delay(3000);

        return;
    } 

    // Visto che ci siamo riusciti a collegare al server
    richiediOTP(); // Allora richiediamo l'OTP

}

/*
    Funzione per stabilire una connessione WIFI
 */
void connettiWifi()
{
    if (IS_EAP) // Se è EAP, allora passiamo le credenziali per effettuare l'accesso
        WiFi.begin(WIFI_SSID, WPA2_AUTH_PEAP, WIFI_USERNAME, WIFI_USERNAME, WIFI_PASSWORD);
    else
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD); // Altrimenti ci collegghiamo normalmente

    tone(BUZZER, 1000, 500); // Buzzerino gioso
    stampaoled(CONNESSIONE_IN_CORSO); // Mostriamo lo stato di connessione
    Serial.println("Connessione WiFi in corso...");

    // Se non siamo connessi
    if (WiFi.status() != WL_CONNECTED)
    {
        delay(5000); // Aspettiamo altri 5 secondi per collegarci

        // Se ancora non ci siamo collegati torniamo indietro
        if(WiFi.status() != WL_CONNECTED)
            return;
    }

    // Se siamo qui vuol dire che ci siamo riusciti a collegare, stampiamo il messaggio
    stampaoled(CONNESSIONE_RIUSCITA);

    tone(BUZZER, 500, 250);     // Tono gioviale
    tone(BUZZER, 1500, 500);    // E molto felice

    delay(1000);

    Serial.println("Connesso alla rete WiFi");
}

/*
    Funzione per richiedere l'OTP, mandando una richiesta al server.
    Viene richiamata sia per prenderlo la prima volta che per aggiornarlo.
 */
void richiediOTP()
{
    // Vogliamo stampare lo stato solo se non stiamo già visualizzando l'OTP
    // Perché se già lo stiamo visualizzando, lo vogliamo solo aggiornare
    if(foundOneTime == 0)
    {
        stampaoled(RICHIESTA_IN_CORSO); 
        tone(BUZZER, 1500, 500);    // Tono gioviale        
        delay(1000);
    }

    HTTPClient http; // Creiamo l'oggetto http
    http.begin(wifiClient, serverAddressOTP); // Avviamo la richiesta HTTP
    http.addHeader("Content-Type", "application/json"); // Aggiungiamo l'header di risposta in json
    http.addHeader(TOKEN_HEADER_NAME, TOKEN_HEADER_VALUE); // Aggiungiamo l'header custom di protezione della rotta
    
    int httpResponseCode = http.GET(); // Effettuaimo la richiesta

    Serial.println("HTTP Response code: " + httpResponseCode); // Stampiamo il codice di risposta (200 OK, ecc...)
    String response;

    // Se il codice di risposta è maggiore di 0 vuol dire che è stato un successo e possiamo mostrare la response
    if (httpResponseCode > 0)
    {
        String response = http.getString(); // Prendiamo il body della risposta
        Serial.println("Response Body: " + response);

        const size_t capacity = JSON_OBJECT_SIZE(2) + JSON_OBJECT_SIZE(1) + 60; // Calcoliamo la dimensione del JSON
        DynamicJsonDocument doc(capacity); // Creiamo un documento json con dimensione come quella precedente

        DeserializationError error = deserializeJson(doc, response); // Se c'è un errore lo memorizziamo in error

        if (error) // Se c'è stato un errore JSON
        {
            Serial.print("Errore parsing JSON: ");            
            Serial.println(error.c_str());

            stampaoled(VISUALIZZA_ERRORE);
            foundOneTime = 0;

            delay(10000); // Delay di 10 secondi per non floodare il server di richieste
            return;
        }

        bool success = doc["success"]; // Controlliamo success nel JSON

        if (!success) // Se non abbiamo avuto successo
        {
            Serial.println("La risposta JSON indica un fallimento.");
            stampaoled(VISUALIZZA_ERRORE);
            tone(BUZZER, 500, 300);
            foundOneTime = 0;

            delay(10000); // Delay di 10 secondi per non floodare il server di richieste
            return;
        }

        // Verifica presenza di "otp"
        if (doc["data"].isNull())
        {
            Serial.println("Nessuna prenotazione per quest'orario.");
            otp = "N/A";
            stampaoled(VISUALIZZA_PRENOTAZIONE_NULLA); // Puoi anche creare un nuovo codice tipo: NESSUNA_PRENOTAZIONE
            tone(BUZZER, 400, 250);
            tone(BUZZER, 400, 250);

            delay(10000); // Delay di 10 secondi per non floodare il server di richieste
            return;
        }

        // Tutto OK, prendi OTP
        otp = String((const char*) doc["data"]["otp"]);

        Serial.println("OTP ricevuto: " + otp);
        stampaoled(VISUALIZZA_OTP);

        if(foundOneTime == 0)
        {
            tone(BUZZER, 1500, 250);
            tone(BUZZER, 2000, 500);
            foundOneTime = 1;
        }

        delay(10000); // Delay di 10 secondi per non floodare il server di richieste
    }
    else
    {
        Serial.println("Errore nella richiesta HTTP");
        stampaoled(VISUALIZZA_ERRORE);
        foundOneTime = 0;

        tone(BUZZER, 500, 250);
        tone(BUZZER, 250, 500);
    }

    // Free resources
    http.end();

    delay(10000); // Delay di 10 secondi per non floodare il server di richieste
}

/*
    Funzione che stampa dei messaggi in base all'intero che gli viene passato.
    Gli interi di riferimento sono in cima al file
 */
void stampaoled(int message)
{
    switch (message)
    {

    case CONNESSIONE_IN_CORSO:
    {
        display.stopscroll();   // ferma lo spostamento del testo        
        display.clearDisplay(); // elimina la scritta
        delay(10);
        display.setTextSize(2);              // Dimensione font
        display.setTextColor(SSD1306_WHITE); // colore, ma il nostro è monocromo (le prima righe gialle)
        display.setCursor(5, 15);
        display.print("CONNECTION");
        display.setCursor(48, 35);
        display.print("...");
        display.display(); // Attiva il testo
        break;
    }
    case CONNESSIONE_NON_RIUSCITA:
    {
        display.stopscroll();   // ferma lo spostamento del testo
        display.clearDisplay(); // elimina la scritta
        delay(10);
        display.setTextSize(2);              // Dimensione font
        display.setTextColor(SSD1306_WHITE); // colore, ma il nostro è monocromo (le prima righe gialle)
        display.setCursor(5, 15);
        display.print("CONNECTION");
        display.setCursor(33, 35);
        display.print("FAILED");
        display.display(); // Attiva il testo
        break;
    }
    case CONNESSIONE_RIUSCITA:
    {
        display.stopscroll();   // ferma lo spostamento del testo
        display.clearDisplay(); // elimina la scritta
        delay(10);
        display.setTextSize(2);              // Dimensione font
        display.setTextColor(SSD1306_WHITE); // colore, ma il nostro è monocromo (le prima righe gialle)
        display.setCursor(15, 25);
        display.print("CONNESSO");
        display.display(); // Attiva il testo
        break;
    }
    case RICHIESTA_IN_CORSO:
    {
        display.stopscroll();   // ferma lo spostamento del testo
        display.clearDisplay(); // elimina la scritta
        delay(10);
        display.setTextSize(2);              // Dimensione font
        display.setTextColor(SSD1306_WHITE); // colore, ma il nostro è monocromo (le prima righe gialle)
        display.setCursor(5, 5);
        display.print("MI COLLEGO");
        display.setCursor(10, 30);
        display.print("AL SERVER");
        display.setCursor(48, 45);
        display.print("...");
        display.display(); // Attiva il testo
        break;
    }
    case VISUALIZZA_OTP:
    {
        display.stopscroll();   // ferma lo spostamento del testo
        display.clearDisplay(); // elimina la scritta
        delay(10);
        display.setTextSize(2);              // Dimensione font
        display.setTextColor(SSD1306_WHITE); // colore, ma il nostro è monocromo (le prima righe gialle)
        display.setCursor(50, 10);
        display.print("OTP");
        display.setCursor(30, 40);
        display.print(otp);
        display.display(); // Attiva il testo
        break;
    }
    case VISUALIZZA_PRENOTAZIONE_NULLA:
        display.stopscroll();   // ferma lo spostamento del testo
        display.clearDisplay(); // elimina la scritta
        delay(10);
        display.setTextSize(2);              // Dimensione font
        display.setTextColor(SSD1306_WHITE); // colore, ma il nostro è monocromo (le prima righe gialle)
        display.setCursor(30, 15);
        display.print("TAVOLO");
        display.setCursor(35, 35);
        display.print("VUOTO");
        display.display(); // Attiva il testo
        break;
    break;
    case VISUALIZZA_ERRORE:
    {
        display.stopscroll();   // ferma lo spostamento del testo
        display.clearDisplay(); // elimina la scritta
        delay(10);
        display.setTextSize(2);              // Dimensione font
        display.setTextColor(SSD1306_WHITE); // colore, ma il nostro è monocromo (le prima righe gialle)
        display.setCursor(30, 5);
        display.print("ERRORE");
        display.setCursor(22, 30);
        display.print("RIPROVO");
        display.setCursor(48, 45);
        display.print("...");
        display.display(); // Attiva il testo
        break;
    }
    }
}