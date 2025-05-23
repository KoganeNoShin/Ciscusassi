import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HeroComponent } from "../../../../components/hero/hero.component";
import { PiattoDelGiornoComponent } from "../../../../components/piatto-del-giorno/piatto-del-giorno.component";
import { ListaMenuComponent } from "../../../../components/lista-menu/lista-menu.component";

@Component({
  selector: 'app-menu-asporto',
  templateUrl: './menu-asporto.page.html',
  styleUrls: ['./menu-asporto.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, HeroComponent, PiattoDelGiornoComponent, ListaMenuComponent]
})
export class MenuAsportoPage implements OnInit {
    nomeUtente: string = "Mario Rossi";

  constructor() { }

  ngOnInit() {
  }

}
