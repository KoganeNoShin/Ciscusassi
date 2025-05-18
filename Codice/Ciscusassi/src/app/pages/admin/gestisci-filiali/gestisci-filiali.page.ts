import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-gestisci-filiali',
  templateUrl: './gestisci-filiali.page.html',
  styleUrls: ['./gestisci-filiali.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class GestisciFilialiPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
