import { Component, OnInit } from '@angular/core';
import { IonHeader, IonIcon, IonToolbar, IonButtons, IonButton } from "@ionic/angular/standalone";

import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [RouterModule, IonHeader, IonIcon, IonToolbar, IonButtons, IonButton],
  standalone: true
})

export class HeaderComponent implements OnInit {

  isItalian = true;

  constructor() {
    addIcons({ personCircle });
  }

  changeLanguage() {
    this.isItalian = !this.isItalian;
  }

  ngOnInit() { }

}
