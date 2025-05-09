import { Component, OnInit } from '@angular/core';

import { IonFooter, IonIcon, IonToolbar, IonButtons, IonButton, IonHeader } from "@ionic/angular/standalone";

import { addIcons } from 'ionicons';
import { personCircle } from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [IonFooter, IonToolbar],
})
export class FooterComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
