import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';

import { HeroComponent } from "../../components/hero/hero.component";

@Component({
  selector: 'app-ristoranti',
  templateUrl: './ristoranti.page.html',
  styleUrls: ['./ristoranti.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, HeroComponent]
})
export class RistorantiPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
