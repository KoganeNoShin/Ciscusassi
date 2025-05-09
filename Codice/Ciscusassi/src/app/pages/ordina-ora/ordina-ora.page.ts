import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ordina-ora',
  templateUrl: './ordina-ora.page.html',
  styleUrls: ['./ordina-ora.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class OrdinaOraPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
