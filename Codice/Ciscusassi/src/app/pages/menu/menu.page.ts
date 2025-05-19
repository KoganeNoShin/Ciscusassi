import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonList, IonItem } from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';

import { MenuService } from './menu.service';
import { IonSpinner } from '@ionic/angular/standalone';
import { Prodotto } from 'src/app/core/interfaces/Prodotto';
import { PiattoDelGiornoComponent } from "../../components/piatto-del-giorno/piatto-del-giorno.component";
import { MenuDividerComponent } from "../../components/menu-divider/menu-divider.component";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
  standalone: true,
  imports: [IonItem, IonList, IonContent, CommonModule, HeroComponent, IonSpinner, PiattoDelGiornoComponent, MenuDividerComponent]
})
export class MenuPage implements OnInit {

  piatti: Prodotto[] = [];
  primi: Prodotto[] = [];
  antipasti: Prodotto[] = [];
  dolci: Prodotto[] = [];
  bevande: Prodotto[] = [];

  loading: boolean = true;
  menuAperto: string | null = null;
  /*
  listaAntipastiAperta = false;
  listaPrimiAperta = false;
  listaDolciAperta = false;
  listaBevandeAperta = false;
  */

  constructor(private menuService: MenuService) { }

  ngOnInit() {
    this.menuService.GetPiatti().subscribe({
      next: (response) => {
        console.log(response);
        this.piatti = response;

        // Filtra i piatti per categoria
        this.primi = this.piatti.filter(p => p.categoria === 'PRIMO');
        this.antipasti = this.piatti.filter(p => p.categoria === 'ANTIPASTO');
        this.dolci = this.piatti.filter(p => p.categoria === 'DOLCE');
        this.bevande = this.piatti.filter(p => p.categoria === 'BEVANDA');
        this.loading = false;
      },
      error: (err) => {
        this.piatti = [];
        this.primi = [];
        this.antipasti = [];
        this.dolci = [];
        this.bevande = [];
        this.loading = false;
      }
    })
  }

  AperturaLista(categoria: string) {
    /*
    this.listaAntipastiAperta = !this.listaAntipastiAperta;
    this.listaPrimiAperta = !this.listaPrimiAperta;
    this.listaDolciAperta = !this.listaDolciAperta;
    this.listaBevandeAperta = !this.listaBevandeAperta;
    */
    this.menuAperto = this.menuAperto === categoria ? null : categoria;
  }

}

