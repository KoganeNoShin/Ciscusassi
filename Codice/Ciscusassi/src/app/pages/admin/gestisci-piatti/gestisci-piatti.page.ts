import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestisci-piatti',
  templateUrl: './gestisci-piatti.page.html',
  styleUrls: ['./gestisci-piatti.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GestisciPiattiPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
