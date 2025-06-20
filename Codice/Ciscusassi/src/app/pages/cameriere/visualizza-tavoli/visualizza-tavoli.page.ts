import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
  IonCardContent,
  IonText
} from '@ionic/angular/standalone';
import { add } from 'ionicons/icons';

@Component({
  selector: 'app-visualizza-tavoli',
  templateUrl: './visualizza-tavoli.page.html',
  styleUrls: ['./visualizza-tavoli.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    IonText,
    CommonModule,
    FormsModule,
  ],
})
export class VisualizzaTavoliPage implements OnInit {
  tavoli = [
    { numero: 9, nome: 'Susino', orario: '20-22', persone: 4, stato: 'in-consegna' },
    { numero: 10, nome: 'Gaetaní', orario: '19-21', persone: 8, stato: 'consegnato' },
    { numero: 5, nome: 'Palma', orario: '21-23', persone: 2, stato: 'preparazione' },
    { numero: 3, nome: 'Luna', orario: '19-20', persone: 6, stato: 'attesa' },
    { numero: 6, nome: '', orario: '', persone: 0, stato: 'senza-ordini' },
  ];

  legenda = [
    { stato: 'attesa', label: 'NON IN LAVORAZIONE' },
    { stato: 'preparazione', label: 'IN LAVORAZIONE' },
    { stato: 'in-consegna', label: 'IN CONSEGNA' },
    { stato: 'consegnato', label: 'CONSEGNATO' },
    { stato: 'senza-ordini', label: 'SENZA ORDINI' }
  ];

  add() {
    console.log('Aggiungi tavolo cliccato');
    // Inserisci qui logica di navigazione o apertura modale
  }

  constructor() {}

  ngOnInit(): void {}
}
