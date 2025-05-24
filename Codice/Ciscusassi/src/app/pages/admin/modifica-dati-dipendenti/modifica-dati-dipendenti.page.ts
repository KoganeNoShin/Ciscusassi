import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonIcon,
  IonInput
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modifica-dati-dipendenti',
  templateUrl: './modifica-dati-dipendenti.page.html',
  styleUrls: ['./modifica-dati-dipendenti.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonCard,
    IonIcon,
    IonInput,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
  ],
})
export class ModificaDatiDipendentiPage implements OnInit {
  nome: string = '';
  cognome: string = '';
  dataNascita: string = '';
  ruolo: string = '';
  email: string = '';
  foto: string = ''; // base64 immagine

  constructor(private router: Router) {}

  ngOnInit() {
  const navigation = this.router.getCurrentNavigation();
if (navigation?.extras?.state && navigation.extras.state['dipendente']) {
  const dip = navigation.extras.state['dipendente'];
  console.log('Dipendente ricevuto:', dip);
  this.nome = dip.nome || '';
  this.cognome = dip.cognome || '';
  this.dataNascita = dip.dataNascita || dip.data_nascita || '';
  this.ruolo = dip.ruolo || '';
  this.email = dip.email || '';
  this.foto = dip.foto || dip.image || '';
} else {
  // Gestisci il caso in cui non ci siano dati, es. mostra un messaggio o reindirizza
  console.warn('Nessun dipendente trovato nello stato della navigazione');
}

  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.foto = reader.result as string; // stringa base64 con data:image/...
        console.log('Immagine convertita in base64:', this.foto);
      };
      reader.readAsDataURL(file);
    }
  }

  salvaModifiche() {
    const datiModificati = {
      nome: this.nome,
      cognome: this.cognome,
      dataNascita: this.dataNascita,
      ruolo: this.ruolo,
      email: this.email,
      foto: this.foto
    };
    console.log('Dati modificati da salvare:', datiModificati);
    // Qui inserisci la chiamata al servizio API per salvare i dati aggiornati
  }
}
