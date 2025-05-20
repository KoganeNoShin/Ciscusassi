import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonCardTitle, IonCardHeader, IonSpinner} from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';
import { LeafletMapComponent } from 'src/app/components/leaflet-map/leaflet-map.component';

import { Filiale } from 'src/app/core/interfaces/Filiale';
import { PrenotaService } from './prenota.service';

@Component({
  selector: 'app-prenota',
  templateUrl: './prenota.page.html',
  styleUrls: ['./prenota.page.scss'],
  standalone: true,
  imports: [IonSpinner, IonCardTitle, IonCardHeader, IonCardContent, IonCard, IonContent, CommonModule, FormsModule, HeroComponent, LeafletMapComponent]
})
export class PrenotaPage implements OnInit {

  filiali: Filiale[] = [];
  loading: boolean = true;

  constructor(private prenotaService: PrenotaService) { }

  ngOnInit() {
    this.prenotaService.GetSedi().subscribe({
      next: (response) => {
        console.log(response);
        this.filiali = response;
        this.loading = false;
      },
      error: (err) => {
        this.filiali = [];
        this.loading = false;
      }
    })
  }
}
