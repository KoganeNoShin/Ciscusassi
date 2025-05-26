import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';
import { PiattoDelGiornoComponent } from 'src/app/components/piatto-del-giorno/piatto-del-giorno.component';
import { ListaMenuComponent } from 'src/app/components/lista-menu/lista-menu.component';

@Component({
  selector: 'app-menu-tavolo',
  templateUrl: './menu-tavolo.page.html',
  styleUrls: ['./menu-tavolo.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, HeroComponent, PiattoDelGiornoComponent, ListaMenuComponent]
})
export class MenuTavoloPage implements OnInit {
  nomeUtente: string = "Mario Rossi";
  numeroTavolo: number = 30;

  constructor() { }

  ngOnInit() {
  }

}
