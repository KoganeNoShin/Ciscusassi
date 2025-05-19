import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonInput, IonContent, IonHeader, IonImg, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { FilialiServiceService } from './filiali-service.service';
import { Filiale } from 'src/app/interfaces/Filiale';
import { RouterModule } from '@angular/router';
import { IonChip } from '@ionic/angular/standalone';



@Component({
  selector: 'app-gestisci-filiali',
  templateUrl: './gestisci-filiali.page.html',
  styleUrls: ['./gestisci-filiali.page.scss'],
  standalone: true,
  imports: [IonContent, RouterModule, IonHeader, IonTitle, IonToolbar, IonInput, CommonModule, FormsModule, IonCard, IonImg, IonChip, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon]
})
export class GestisciFilialiPage implements OnInit {

    filiali: Filiale[] = []; 
    loading: boolean = true;
  
    constructor(private filialiServiceService: FilialiServiceService) { } //la prima è variabile, la seconda è una classe

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
    })
 
 }
 
}


