import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonImg, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ServicePiattiService } from './service-piatti.service';
import { Prodotto } from 'src/app/interfaces/Prodotto';
import {starOutline} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-gestisci-piatti',
  templateUrl: './gestisci-piatti.page.html',
  styleUrls: ['./gestisci-piatti.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon]
})
export class GestisciPiattiPage implements OnInit {
  piatti: Prodotto[] = []; 
  loading: boolean = true;

  constructor(private servicePiattiService: ServicePiattiService) {addIcons({starOutline}); } //la prima è variabile, la seconda è una classe

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
 
}






 