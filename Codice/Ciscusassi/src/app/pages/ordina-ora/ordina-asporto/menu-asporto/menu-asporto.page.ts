import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton } from '@ionic/angular/standalone';
import { HeroComponent } from "../../../../components/hero/hero.component";
import { PiattoDelGiornoComponent } from "../../../../components/piatto-del-giorno/piatto-del-giorno.component";
import { ListaMenuComponent } from "../../../../components/lista-menu/lista-menu.component";
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-menu-asporto',
  templateUrl: './menu-asporto.page.html',
  styleUrls: ['./menu-asporto.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, HeroComponent, PiattoDelGiornoComponent, ListaMenuComponent, IonButton, RouterModule]
})
export class MenuAsportoPage implements OnInit {
    nomeUtente: string = "Mario Rossi";

  constructor() { }

  ngOnInit() {
  }

}
