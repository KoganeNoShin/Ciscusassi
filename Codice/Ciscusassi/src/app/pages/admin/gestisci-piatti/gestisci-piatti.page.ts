import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonAlert, IonContent, IonHeader, IonImg, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ServicePiattiService } from './service-piatti.service';
import { Prodotto } from 'src/app/core/interfaces/Prodotto';
import { starOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { RouterModule } from '@angular/router';
import { IonChip } from '@ionic/angular/standalone';
import { IonInput } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestisci-piatti',
  templateUrl: './gestisci-piatti.page.html',
  styleUrls: ['./gestisci-piatti.page.scss'],
  standalone: true,
  imports: [IonContent, RouterModule, IonInput, IonHeader, IonTitle, IonAlert, IonToolbar, CommonModule, FormsModule, IonCard, IonImg, IonChip, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon]
})
export class GestisciPiattiPage implements OnInit {
  piatti: Prodotto[] = [];
  loading: boolean = true;

  constructor(private servicePiattiService: ServicePiattiService) { addIcons({ starOutline }); } //la prima è variabile, la seconda è una classe

  ngOnInit() {
    this.servicePiattiService.GetPiatti().subscribe({
      next: (response) => {
        console.log(response);
        this.piatti = response;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.piatti = [];
      }
    })

  }

  isAlertOpen = false;
  selectedProdotto: Prodotto | null = null;

  showAlert(prodotto: Prodotto) {
    this.selectedProdotto = prodotto;
    this.isAlertOpen = true;
  }

  onConfirm() {
    if (this.selectedProdotto) {
      console.log('Confermata rimozione filiale:', this.selectedProdotto);
      // Qui puoi chiamare il servizio per rimuovere la filiale, per esempio:
      // this.filialiServiceService.rimuoviFiliale(this.selectedFiliale.id_filiale).subscribe(...);
      // Poi aggiorna la lista, rimuovendo la filiale localmente o rifacendo la fetch
    }
    this.isAlertOpen = false;
    this.selectedProdotto = null;
  }

  onCancel() {
    console.log('Rimozione annullata');
    this.isAlertOpen = false;
    this.selectedProdotto = null;
  }
  alertButtons = [
    {
      text: 'Annulla',
      role: 'cancel',
      handler: () => this.onCancel()
    },
    {
      text: 'OK',
      role: 'confirm',
      handler: () => this.onConfirm()
    }
  ];

}






