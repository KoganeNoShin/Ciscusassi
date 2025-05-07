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

// Credenziali wifi
#define WIFI_SSID SECRET_SSID         // SSID WiFi
#define WIFI_IDENTITY SECRET_USERNAME // Es: mario.rossi03
#define WIFI_PASSWORD SECRET_PASSWORD
#define WIFI_USERNAME SECRET_USERNAME // Stesso di EAP_IDENTITY
#define IS_EAP SECRET_IS_EAP          // Se siamo collegati ad una rete EAP
#define OTP_ROUTE SECRET_OTP
#define ID_TAVOLO SECRET_ID_TAVOLO // Gestione prodotti
#define TOKEN_HEADER_NAME SECRET_HEADER_NAME
#define TOKEN_HEADER_VALUE SECRET_HEADER_VALUE

// Rotte
const char *serverAddressOTP = OTP_ROUTE;
WiFiClient wifiClient;

// Codici di stampa per la funzione stampaOled()
#define CONNESSIONE_IN_CORSO 1
#define CONNESSIONE_RIUSCITA 2
#define RICHIESTA_IN_CORSO 3
#define VISUALIZZA_OTP 4
#define VISUALIZZA_ERRORE 13 // C'è stato un errore nella richiesta http

#define BUZZER 4 // Buzzer Pin

// Impostazione schermo
#define SCREEN_WIDTH 128    // OLED display width, in pixels
#define SCREEN_HEIGHT 64    // OLED display height, in pixels
#define OLED_RESET -1       // Reset pin # (or -1 if sharing Arduino reset pin)
#define SCREEN_ADDRESS 0x3C // See datasheet for Address; 0x3D for 128x64, 0x3C for 128x32

// Creazione "oggetto" display
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

String otp = "";

void setup()
{
    Wire.begin(21, 22);   // SDA, SCL
    Serial.begin(115200); // Initialize serial communications with the PC
    delay(1000);
    Serial.println("Setup");

    pinMode(BUZZER, OUTPUT);

    if (!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS))
    {
        Serial.println(F("SSD1306 allocation failed"));
        for (;;)
            ; // Blocco se non si inizializza
    }

    display.clearDisplay();
    display.display();

    connettiWifi(); // Ci connettiamo al wifi
}

void loop()
{
    // Se non siamo connessi allora blocca tutto
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("Connessione WiFi mancante, riprovo a connettermi...");
        return;
    }
}

void connettiWifi()
{
    if (IS_EAP)
        WiFi.begin(WIFI_SSID, WPA2_AUTH_PEAP, WIFI_USERNAME, WIFI_USERNAME, WIFI_PASSWORD); // Passiamo le credenziali e istanziamo una nuova connessione
    else
        WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    tone(BUZZER, 1000, 500);
    stampaoled(CONNESSIONE_IN_CORSO);

    while (WiFi.status() != WL_CONNECTED) // Se non siamo ancora connessi
    {
        Serial.println("Connessione WiFi in corso...");
    }

    delay(1000);

    stampaoled(CONNESSIONE_RIUSCITA);

    tone(BUZZER, 500, 250);
    tone(BUZZER, 1500, 500);

    delay(1000);

    Serial.println("Connesso alla rete WiFi");

    stampaoled(RICHIESTA_IN_CORSO);
    delay(1000);

    // Avviamo la richiesta HTTP
    HTTPClient http;
    http.begin(wifiClient, serverAddressOTP);
    http.addHeader("Content-Type", "application/json");
    http.addHeader(TOKEN_HEADER_NAME, TOKEN_HEADER_VALUE);
    int httpResponseCode = http.GET(); // Passiamo come body il json

    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode); // Stampiamo il codice di risposta
    String response;

    // Se il codice di risposta è maggiore di 0 vuol dire che è stato un successo e possiamo mostrare la response
    if (httpResponseCode > 0)
    {
        response = http.getString();
        Serial.print("Response Body: ");

        otp = response;
        stampaoled(VISUALIZZA_OTP);

        tone(BUZZER, 1500, 250);
        tone(BUZZER, 2000, 500);

        Serial.println(response);
    }
    else
    {
        Serial.println("Errore nella richiesta HTTP");
        stampaoled(VISUALIZZA_ERRORE);

        tone(BUZZER, 500, 250);
        tone(BUZZER, 250, 500);
    }

    // Free resources
    http.end();
}

void stampaoled(int i)
{
    switch (i)
    {

    case CONNESSIONE_IN_CORSO:
    {
        display.stopscroll();   // ferma lo spostamento del testo
        display.clearDisplay(); // elimina la scritta
        delay(10);
        display.setTextSize(2);              // Dimensione font
        display.setTextColor(SSD1306_WHITE); // colore, ma il nostro è monocromo (le prima righe gialle)
        display.setCursor(5, 15);
        display.print("CONNECTING");
        display.setCursor(48, 35);
        display.print("...");
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
        display.setCursor(7, 25);
        display.print("CONNECTED!");
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
        display.setCursor(20, 5);
        display.print("REACHING");
        display.setCursor(5, 30);
        display.print("THE SERVER");
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
        display.setCursor(35, 40);
        display.print(otp);
        display.display(); // Attiva il testo
        break;
    }
    case VISUALIZZA_ERRORE:
    {
        display.stopscroll();   // ferma lo spostamento del testo
        display.clearDisplay(); // elimina la scritta
        delay(10);
        display.setTextSize(2);              // Dimensione font
        display.setTextColor(SSD1306_WHITE); // colore, ma il nostro è monocromo (le prima righe gialle)
        display.setCursor(37, 25);
        display.print("ERROR");
        display.display(); // Attiva il testo
        break;
    }
    }
}