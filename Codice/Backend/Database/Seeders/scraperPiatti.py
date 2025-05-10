import requests
import base64
from bs4 import BeautifulSoup

import json

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class Prodotto:
    def __init__(self, nome, descrizione, categoria, immagine):
        self.nome = nome
        self.descrizione = descrizione
        self.immagine = immagine
        self.categoria = categoria

    def __repr__(self):
        return f"Prodotto(nome='{self.nome}', descrizione='{self.descrizione}, categoria='{self.categoria}', image='{self.immagine}')"

    def to_dict(self):
        return {
            'nome': self.nome,
            'descrizione': self.descrizione,
            'categoria': self.categoria,
            'immagine': self.immagine
        }

def converti_immagine_base64(immagine_url):    
    try:
        response = requests.get(immagine_url)
        response.raise_for_status()
        img_bytes = response.content
        base64_str = base64.b64encode(img_bytes).decode('utf-8')
        return base64_str
    except Exception as e:
        print(f"Errore nel download/conversione dell'immagine per {immagine_url}: {e}")
        return ""

chrome_options = Options()
chrome_options.add_argument("--headless")  # Modalità headless, esegue il browser in background.
driver = webdriver.Chrome(options=chrome_options)

# fetch the page content
url = 'https://miscusi.com/it/menu-ristorante'

driver.get(url)

# Aspetta che il bottone dei cookie sia visibile e cliccalo
try:
    cookie_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "cookieBannerAccept"))
    )
    cookie_button.click()
except:
    print("Cookie banner non trovato o già accettato.")

# Ora puoi continuare ad aspettare il contenuto
WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.CLASS_NAME, "name"))
)

html = driver.page_source
driver.quit()

soup = BeautifulSoup(html, 'html.parser')

products_tags = soup.find_all('div', class_="sectionCarousel_slide menuSignatureSlide")
prodotti = []

for tag in products_tags:
    nome = tag.find('h4', class_="name uk-text-uppercase")
    descrizione = tag.find('span', class_="description clear-html")
    immagine_tag = tag.find('img')
    immagine = converti_immagine_base64(immagine_tag['src'])

    prodotto = Prodotto(
        nome = nome.get_text(strip=True) if nome else '',
        descrizione = descrizione.find('p').get_text(strip=True) if descrizione and descrizione.find('p') else descrizione.get_text(strip=True),
        categoria = "PRIMO",
        immagine = immagine
    )

    prodotti.append(prodotto)

prodotti_dict = [prodotto.to_dict() for prodotto in prodotti]

with open('prodotti.json', 'w', encoding='utf-8') as f:
    json.dump(prodotti_dict, f, ensure_ascii=False, indent=4)