import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCard, IonContent, IonHeader, IonIcon, IonInput, IonTextarea, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonBackButton } from '@ionic/angular/common';

@Component({
  selector: 'app-aggiungi-piatti',
  templateUrl: './aggiungi-piatti.page.html',
  styleUrls: ['./aggiungi-piatti.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonCard, IonIcon, IonInput, IonTextarea, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton]
})
export class AggiungiPiattiPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
