import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonIcon, IonInput, IonButton} from '@ionic/angular/standalone';

@Component({
  selector: 'app-modifica-filiali',
  templateUrl: './modifica-filiali.page.html',
  styleUrls: ['./modifica-filiali.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonIcon, IonInput, IonButton]
})
export class ModificaFilialiPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
