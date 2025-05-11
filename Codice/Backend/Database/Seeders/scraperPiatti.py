# Per poter accettare il banner dei cookie in automatico
from selenium import webdriver 
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from bs4 import BeautifulSoup # Per fare web-scraping

import requests # Per poter effettuare richieste get
import base64 # Per trasformare le immagini in base64 per memorizzarle nel DB

import json # Per codificare i risultati in json

# Creiamo la classe prodotto per poter manipolare meglio gli oggetti che troviamo
class Prodotto:
    def __init__(self, nome, descrizione, categoria, immagine):
        self.nome = nome
        self.descrizione = descrizione
        self.immagine = immagine
        self.categoria = categoria

    # Funzione tostring
    def __repr__(self):
        return f"Prodotto(nome='{self.nome}', descrizione='{self.descrizione}, categoria='{self.categoria}', image='{self.immagine}')"

    # Funzione per trasformare i prodotti in un dizionario
    def to_dict(self):
        return {
            'nome': self.nome,
            'descrizione': self.descrizione,
            'categoria': self.categoria,
            'immagine': self.immagine
        }

# Funzione per convertire un immagine in base 64
def converti_immagine_base64(immagine_url):    
    try:
        response = requests.get(immagine_url) # Effettuiamo una richiesta alla risorsa dell'immagine
        response.raise_for_status() # Se c'è un errore lo lanciamo
        img_bytes = response.content # Trasformiamo in bytes il contenuto della risposta
        base64_str = base64.b64encode(img_bytes).decode('utf-8') # Effettuiamo l'encoding in base 64 dei bytes
        return base64_str # Ritorniamo la stringa in base64
    except Exception as e:
        print(f"Errore nel download/conversione dell'immagine per {immagine_url}: {e}")
        return ""

chrome_options = Options() # Tramite selenium creiamo un browser
chrome_options.add_argument("--headless")  # in modalità headless, eseguendolo quindi background.
driver = webdriver.Chrome(options=chrome_options)

# L'url nella quale dobbiamo fare scraping
url = 'https://miscusi.com/it/menu-ristorante'

# Impostiamo il browser in qull'url
driver.get(url)

# Aspettiamo che il bottone dei cookie sia visibile e lo clicchiamo
try:
    cookie_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "cookieBannerAccept"))
    )
    cookie_button.click()
except:
    print("Cookie banner non trovato o già accettato.")

# Ora aspettiamo il contenuto
WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.CLASS_NAME, "name"))
)

html = driver.page_source # Prendiamo la sorgente della pagina
driver.quit() # Chiudiamo il browser

# Inizializziamo il parser per lo scraping e gli passiamo la pagina
soup = BeautifulSoup(html, 'html.parser')

# Troviamo la div dove sono visualizzati i primi
primi = soup.find_all('div', class_="sectionCarousel_slide menuSignatureSlide")

# Troviamo la div dove sono visualizzati i contorni
contorni_section = soup.find('div', id="13-section")
if contorni_section:
    contorni = contorni_section.find_all('div', class_="sectionCarousel_slide")
else:
    contorni = []

# Troviamo la div dove sono visualizzati i dolci
dolci_section = soup.find('div', id="19-section")
if dolci_section:
    dolci = dolci_section.find_all('div', class_="sectionCarousel_slide")
else:
    dolci = []

# Troviamo la div dove sono visualizzate le bevande

# Troviamo la div dove sono visualizzati i dolci
bevande_section = soup.find('div', id="14-section")
if bevande_section:
    bevande = bevande_section.find_all('div', class_="sectionCarousel_slide")
else:
    bevande = []

prodotti = []

for tag in primi: # Per ogni prodotto trovato
    nome = tag.find('h4', class_="name uk-text-uppercase") # Memorizziamo il nome
    descrizione = tag.find('span', class_="description clear-html") # Memorizziamo la descrizione
    immagine_tag = tag.find('img') # Troviamo l'immagine
    immagine = converti_immagine_base64(immagine_tag['src']) # La convertiamo e la memorizziamo

    # Creiamo l'oggetto con i dati che abbiamo memorizzato
    prodotto = Prodotto(
        nome = nome.get_text(strip=True) if nome else '',
        descrizione = descrizione.find('p').get_text(strip=True) if descrizione and descrizione.find('p') else descrizione.get_text(strip=True),
        categoria = "PRIMO",
        immagine = immagine
    )

    # Lo aggiungiamo tra i prodotti
    prodotti.append(prodotto)

# Aggiungi i prodotti dalla sezione dei contorni
for tag in contorni:
    nome = tag.find('h4', class_="name uk-text-uppercase") # Memorizziamo il nome
    descrizione = tag.find('span', class_="description clear-html")  # Memorizziamo la descrizione
    immagine_tag = tag.find('img')  # Troviamo l'immagine
    immagine = converti_immagine_base64(immagine_tag['src']) if immagine_tag else None  # La convertiamo e la memorizziamo

    # Se la descrizione non esiste, assegna una stringa vuota
    if descrizione:
        descrizione_testo = descrizione.find('p').get_text(strip=True) if descrizione.find('p') else descrizione.get_text(strip=True)
    else:
        descrizione_testo = ''  # Se non c'è descrizione, metti una stringa vuota

    # Creiamo l'oggetto con i dati che abbiamo memorizzato
    prodotto = Prodotto(
        nome=nome.get_text(strip=True) if nome else '',
        descrizione=descrizione_testo,
        categoria="ANTIPASTO",
        immagine=immagine
    )

    # Lo aggiungiamo tra i prodotti
    prodotti.append(prodotto)

# Aggiungi i prodotti dalla sezione dei dolci
for tag in dolci:
    nome = tag.find('h4', class_="name uk-text-uppercase").get_text(strip=True) # Memorizziamo il nome
    descrizione = tag.find('span', class_="description clear-html")  # Memorizziamo la descrizione
    immagine_tag = tag.find('img')  # Troviamo l'immagine
    immagine = converti_immagine_base64(immagine_tag['src']) if immagine_tag else None  # La convertiamo e la memorizziamo

    if nome == "Tiramiscusi":
        nome = "Tiraciscusassi"

    # Se la descrizione non esiste, assegna una stringa vuota
    if descrizione:
        descrizione_testo = descrizione.find('p').get_text(strip=True) if descrizione.find('p') else descrizione.get_text(strip=True)
    else:
        descrizione_testo = ''  # Se non c'è descrizione, metti una stringa vuota

    # Creiamo l'oggetto con i dati che abbiamo memorizzato
    prodotto = Prodotto(
        nome=nome,
        descrizione=descrizione_testo,
        categoria="DOLCE",
        immagine=immagine
    )

    # Lo aggiungiamo tra i prodotti
    prodotti.append(prodotto)

# Aggiungi i prodotti dalla sezione dei dolci
for tag in bevande:


    # Estrai il nome della bevanda principale (ad esempio, "Vino rosso", "Vino bianco", etc.)
    nome = tag.find('h4', class_="name uk-text-uppercase").get_text(strip=True)

    # Estrai l'immagine del prodotto
    immagine_tag = tag.find('img')  # Troviamo l'immagine
    immagine = converti_immagine_base64(immagine_tag['src']) if immagine_tag else None  # La convertiamo e la memorizziamo

    # Troviamo tutte le descrizioni per questa bevanda
    descrizioni = tag.find_all('span', class_="uk-text-uppercase description")

    # Creiamo un prodotto separato per ogni descrizione
    for descrizione in descrizioni:
        descrizione_testo = descrizione.get_text(strip=True)

        # Se il nome della bevanda è "M-Spritz", modifichiamo il nome
        if nome == "M-Spritz":
            nome = "C-Spritz"

        # Creiamo l'oggetto prodotto per ogni descrizione
        prodotto = Prodotto(
            nome=f"{nome} - {descrizione_testo}",
            descrizione=descrizione_testo,
            categoria="BEVANDA",
            immagine=immagine
        )

        # Lo aggiungiamo alla lista dei prodotti
        prodotti.append(prodotto)

# Trasformiamo in un dizionario 
prodotti_dict = [prodotto.to_dict() for prodotto in prodotti]

# Eseguiamo la conversione dei prodotti in json ed esportiamo nel file prodotti.json
with open('prodotti.json', 'w', encoding='utf-8') as f:
    json.dump(prodotti_dict, f, ensure_ascii=False, indent=4)