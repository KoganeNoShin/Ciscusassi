import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonItem, IonButtons, IonMenuButton, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, IonHeader, IonToolbar, IonTitle, IonItem, IonMenuButton, IonButtons, IonButton],
})
export class AppComponent {
  constructor() {}
}
