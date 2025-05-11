import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-amministrazione',
  templateUrl: './amministrazione.page.html',
  styleUrls: ['./amministrazione.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AmministrazionePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
