import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonIcon,
  IonInput,
  IonButton,
  IonList,
  IonItem,
  ToastController,
} from '@ionic/angular/standalone';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FilialeService } from 'src/app/core/services/filiale.service';
import { FilialeInput } from 'src/app/core/interfaces/Filiale';

@Component({
  selector: 'app-aggiungi-filiali',
  templateUrl: './aggiungi-filiali.page.html',
  styleUrls: ['./aggiungi-filiali.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonCard,
    IonIcon,
    IonInput,
    IonButton,
    IonList,
    IonItem,
    HttpClientModule,
  ],
})
export class AggiungiFilialiPage implements OnInit {
  indirizzo: string = '';
  comune: string = '';
  numTavoli: number | null = null;
  immagineBase64: string = '';
  suggestions: string[] = [];
  timeout: any = null;

  constructor(
    private filialeService: FilialeService,
    private toastController: ToastController,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const navigation = window.history.state;
    if (navigation && navigation.filiale) {
      const f = navigation.filiale;
      this.indirizzo = f.indirizzo || '';
      this.comune = f.comune || '';
      this.numTavoli = f.num_tavoli ?? null;
      this.immagineBase64 = f.immagine || '';
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.immagineBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.presentToast('Seleziona un file immagine valido.', 'warning');
    }
  }

  onIndirizzoInput(): void {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (this.indirizzo.trim().length < 3) {
        this.suggestions = [];
        return;
      }

      const query = `${this.indirizzo}, ${this.comune}`;
      this.http
        .get<any[]>(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`
        )
        .subscribe(
          (res) => {
            this.suggestions = res.map((item) => item.display_name);
          },
          (err) => {
            console.error('Errore durante il suggerimento:', err);
            this.suggestions = [];
          }
        );
    }, 300);
  }

  selectSuggestion(s: string): void {
    this.indirizzo = s;
    this.suggestions = [];
  }

  async creaFiliale(): Promise<void> {
    if (
      !this.indirizzo.trim() ||
      !this.comune.trim() ||
      this.numTavoli === null ||
      !this.immagineBase64
    ) {
      this.presentToast('Compila tutti i campi obbligatori.', 'warning');
      return;
    }

    const fullAddress = `${this.indirizzo}, ${this.comune}`;
    try {
      const coords = await this.geocodificaIndirizzo(fullAddress);
      if (!coords) {
        this.presentToast('Indirizzo non trovato. Verifica e riprova.', 'danger');
        return;
      }

      const nuovaFiliale: FilialeInput = {
        indirizzo: this.indirizzo,
        comune: this.comune,
        num_tavoli: this.numTavoli,
        immagine: this.immagineBase64,
        latitudine: coords.lat,
        longitudine: coords.lon,
      };

      this.filialeService.addFiliale(nuovaFiliale).subscribe({
        next: async (res) => {
          if (res.success) {
            this.presentToast('Filiale aggiunta con successo! 🎉', 'success');
            this.resetForm();
          } else {
            this.presentToast("Errore durante l'aggiunta della filiale.", 'danger');
          }
        },
        error: (err) => {
          console.error(err);
          this.presentToast('Errore di rete o server.', 'danger');
        },
      });
    } catch (error) {
      console.error(error);
      this.presentToast('Errore nel recupero coordinate.', 'danger');
    }
  }

  async geocodificaIndirizzo(address: string): Promise<{ lat: number; lon: number } | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;
    try {
      const res: any = await this.http.get(url).toPromise();
      if (res && res.length > 0) {
        return {
          lat: parseFloat(res[0].lat),
          lon: parseFloat(res[0].lon),
        };
      }
      return null;
    } catch (err) {
      console.error('Errore geocoding:', err);
      return null;
    }
  }

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });
    toast.present();
  }

  resetForm(): void {
    this.indirizzo = '';
    this.comune = '';
    this.numTavoli = null;
    this.immagineBase64 = '';
    this.suggestions = [];
  }
}
