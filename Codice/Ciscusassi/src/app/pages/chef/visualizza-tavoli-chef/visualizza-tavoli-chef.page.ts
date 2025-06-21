import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  ToastController,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-visualizza-tavoli-chef',
  templateUrl: './visualizza-tavoli-chef.page.html',
  styleUrls: ['./visualizza-tavoli-chef.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    CommonModule,
    FormsModule,
  ],
})
export class VisualizzaTavoliChefPage implements OnInit {
  tavoli = [
    { numero: 1, nome: 'Susino', orario: '20-22', persone: 4, stato: 'in-consegna' },
    { numero: 2, nome: 'Gaetaní', orario: '19-21', persone: 8, stato: 'consegnato' },
    { numero: 3, nome: 'Luna', orario: '19-20', persone: 6, stato: 'attesa' },
    { numero: 4, nome: 'Bianco1', orario: '22-23', persone: 3, stato: 'senza-ordini' },
    { numero: 5, nome: 'Bianco2', orario: '20-21', persone: 2, stato: 'senza-ordini' }
  ];

  legenda = [
    { stato: 'in-consegna', label: 'IN CONSEGNA' },
    { stato: 'consegnato', label: 'CONSEGNATO' },
    { stato: 'attesa', label: 'NON IN LAVORAZIONE' },
    { stato: 'preparazione', label: 'IN LAVORAZIONE' },
    { stato: 'senza-ordini', label: 'SENZA ORDINI' }
  ];

  constructor(private toastController: ToastController) {}

  ngOnInit(): void {}

  isCliccabile(tavolo: any): boolean {
    return tavolo.stato !== 'senza-ordini';
  }

  handleClick(tavolo: any) {
    if (this.isCliccabile(tavolo)) {
      console.log('Hai cliccato sul tavolo:', tavolo);
      // Azione per tavoli attivi
    }
  }

  async presentToast(messaggio: string) {
    const toast = await this.toastController.create({
      message: messaggio,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }
}
