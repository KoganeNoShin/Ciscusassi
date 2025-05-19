import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonAlert, IonInput, IonContent, IonHeader, IonImg, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { FilialiServiceService } from './filiali-service.service';
import { Filiale } from 'src/app/core/interfaces/Filiale';
import { RouterModule } from '@angular/router';
import { IonChip } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestisci-filiali',
  templateUrl: './gestisci-filiali.page.html',
  styleUrls: ['./gestisci-filiali.page.scss'],
  standalone: true,
  imports: [IonContent, RouterModule, IonHeader, IonTitle, IonToolbar, IonAlert, IonInput, CommonModule, FormsModule, IonCard, IonImg, IonChip, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon]
})
export class GestisciFilialiPage implements OnInit {

  filiali: Filiale[] = [];
  loading: boolean = true;



  constructor(private filialiServiceService: FilialiServiceService) { }

  ngOnInit() {
    this.filialiServiceService.GetFiliali().subscribe({
      next: (response) => {
        console.log(response);
        this.filiali = response;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.filiali = [];
      }
    });
  }

  isAlertOpen = false;
  selectedFiliale: Filiale | null = null;

  showAlert(filiale: Filiale) {
    this.selectedFiliale = filiale;
    this.isAlertOpen = true;
  }

  onConfirm() {
    if (this.selectedFiliale) {
      console.log('Confermata rimozione filiale:', this.selectedFiliale);
      // Qui puoi chiamare il servizio per rimuovere la filiale, per esempio:
      // this.filialiServiceService.rimuoviFiliale(this.selectedFiliale.id_filiale).subscribe(...);
      // Poi aggiorna la lista, rimuovendo la filiale localmente o rifacendo la fetch
    }
    this.isAlertOpen = false;
    this.selectedFiliale = null;
  }

  onCancel() {
    console.log('Rimozione annullata');
    this.isAlertOpen = false;
    this.selectedFiliale = null;
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
