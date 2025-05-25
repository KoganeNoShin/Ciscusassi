import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-cambia-password',
  templateUrl: './cambia-password.page.html',
  styleUrls: ['./cambia-password.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CambiaPasswordPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
