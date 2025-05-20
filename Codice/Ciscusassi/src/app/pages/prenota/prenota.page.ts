import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSpinner, IonContent, IonCardContent, IonInput, IonItem, IonGrid, IonRow, IonCol, IonList, IonAvatar, IonLabel} from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';
import { LeafletMapComponent } from 'src/app/components/leaflet-map/leaflet-map.component';

import { Filiale } from 'src/app/core/interfaces/Filiale';
import { PrenotaService } from './prenota.service';



@Component({
  selector: 'app-prenota',
  templateUrl: './prenota.page.html',
  styleUrls: ['./prenota.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonList, IonLabel, IonAvatar, IonList, IonCol, IonRow, IonGrid, IonItem, IonInput, IonSpinner, IonCardContent, IonContent, CommonModule, FormsModule, HeroComponent, LeafletMapComponent]
})
export class PrenotaPage implements OnInit {

  filiali: Filiale[] = [];
  loading: boolean = true;

  searchFiliale: string = '';
  filialiFiltrate: any[] = [];

  constructor(private prenotaService: PrenotaService) { }

  ngOnInit() {
    this.prenotaService.GetSedi().subscribe({
      next: (response) => {
        console.log(response);
        this.filiali = response;
        this.loading = false;
        this.filialiFiltrate = this.filiali
      },
      error: (err) => {
        this.filiali = [];
        this.loading = false;
        this.filialiFiltrate = [];
      }
    })
  }

  filtroFiliali(){
    const term = this.searchFiliale.toLowerCase();

    this.filialiFiltrate = this.filiali.filter((filiale) => filiale.indirizzo.toLowerCase().includes(term))
  }
}
