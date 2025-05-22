import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonIcon, IonInput, IonTextarea, IonButton } from '@ionic/angular/standalone';


@Component({
  selector: 'app-aggiungi-filiali',
  templateUrl: './aggiungi-filiali.page.html',
  styleUrls: ['./aggiungi-filiali.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonIcon, IonInput, IonButton]
})
export class AggiungiFilialiPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
