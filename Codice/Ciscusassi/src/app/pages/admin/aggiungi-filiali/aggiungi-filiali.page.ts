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
} from '@ionic/angular/standalone';

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
  ],
})
export class AggiungiFilialiPage implements OnInit {
  indirizzo: string = '';
  comune: string = '';
  numTavoli: number | null = null;
  immagineBase64: string = '';

  constructor() {}

  ngOnInit() {
    // Precaricamento dati da navigation state, se presente
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
      alert('Seleziona un file immagine valido.');
    }
  }

  creaFiliale(): void {
    if (!this.indirizzo.trim() || !this.comune.trim() || this.numTavoli === null || !this.immagineBase64) {
      alert('⚠️ Compila tutti i campi obbligatori e inserisci un\'immagine.');
      return;
    }

    // Qui puoi mettere la logica per salvare la filiale tramite servizio API
    console.log('Filiale da creare/modificare:', {
      indirizzo: this.indirizzo,
      comune: this.comune,
      numTavoli: this.numTavoli,
      immagineBase64: this.immagineBase64,
    });

    alert('Filiale creata/modificata con successo!');
    this.resetForm();
  }

  resetForm(): void {
    this.indirizzo = '';
    this.comune = '';
    this.numTavoli = null;
    this.immagineBase64 = '';
  }
}
