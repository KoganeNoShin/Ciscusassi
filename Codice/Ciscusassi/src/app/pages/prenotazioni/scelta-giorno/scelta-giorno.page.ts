import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-scelta-giorno',
  templateUrl: './scelta-giorno.page.html',
  styleUrls: ['./scelta-giorno.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SceltaGiornoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
