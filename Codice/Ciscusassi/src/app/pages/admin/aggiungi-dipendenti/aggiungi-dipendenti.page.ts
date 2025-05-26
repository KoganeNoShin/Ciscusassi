import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonIcon,
  IonInput,
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-aggiungi-dipendenti',
  templateUrl: './aggiungi-dipendenti.page.html',
  styleUrls: ['./aggiungi-dipendenti.page.scss'],
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
    RouterLink
  ]
})
export class AggiungiDipendentiPage implements OnInit {
  // Campi associati al form
  nome: string = '';
  cognome: string = '';
  dataNascita: string = '';
  ruolo: string = '';
  email: string = '';
  imageBase64: string | null = null;

  constructor() {}

  ngOnInit() {}

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  aggiungiDipendente() {
    const nuovoDipendente = {
      nome: this.nome,
      cognome: this.cognome,
      dataNascita: this.dataNascita,
      ruolo: this.ruolo,
      email: this.email,
      immagine: this.imageBase64
    };

    console.log('Nuovo Dipendente:', nuovoDipendente);
    // Qui puoi fare un POST API o salvataggio nel database
  }
}
