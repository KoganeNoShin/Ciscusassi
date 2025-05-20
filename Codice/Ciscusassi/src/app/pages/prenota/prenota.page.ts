import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonCardTitle, IonCardHeader} from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';
import { LeafletMapComponent } from 'src/app/components/leaflet-map/leaflet-map.component';

import { Filiale } from 'src/app/core/interfaces/Filiale';

@Component({
  selector: 'app-prenota',
  templateUrl: './prenota.page.html',
  styleUrls: ['./prenota.page.scss'],
  standalone: true,
  imports: [IonCardTitle, IonCardHeader, IonCardContent, IonCard, IonContent, CommonModule, FormsModule, HeroComponent, LeafletMapComponent]
})
export class PrenotaPage implements OnInit {

  //filiale = Filiale[] = [];
  loading: boolean = true;

  constructor() { }

  ngOnInit() {
  }

}
