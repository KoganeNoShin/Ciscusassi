import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HeroComponent } from "../../components/hero/hero.component";

@Component({
  selector: 'app-ristoranti',
  templateUrl: './ristoranti.page.html',
  styleUrls: ['./ristoranti.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, HeroComponent]
})
export class RistorantiPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
