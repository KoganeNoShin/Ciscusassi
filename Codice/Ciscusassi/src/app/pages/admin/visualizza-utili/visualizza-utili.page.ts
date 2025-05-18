import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-visualizza-utili',
  templateUrl: './visualizza-utili.page.html',
  styleUrls: ['./visualizza-utili.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class VisualizzaUtiliPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
