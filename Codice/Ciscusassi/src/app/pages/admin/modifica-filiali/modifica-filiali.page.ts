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
  selector: 'app-modifica-filiali',
  templateUrl: './modifica-filiali.page.html',
  styleUrls: ['./modifica-filiali.page.scss'],
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
export class ModificaFilialiPage implements OnInit {
  filiale = {
    indirizzo: '',
    comune: '',
    num_tavoli: 0,
    immagine: '',
  };

  constructor() {}

  ngOnInit() {
    const navigation = window.history.state;
    if (navigation && navigation.filiale) {
      this.filiale = { ...navigation.filiale };
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.filiale.immagine = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Seleziona un file immagine valido.');
    }
  }

  modificaFiliale() {
    console.log('Filiale modificata:', this.filiale);
    // Qui chiama il service per salvare la filiale modificata
  }
}
