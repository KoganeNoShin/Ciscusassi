import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-numero-persone',
  templateUrl: './numero-persone.page.html',
  styleUrls: ['./numero-persone.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NumeroPersonePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
