import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProdottoOrdineComponent } from '../prodotto-ordine/prodotto-ordine.component';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lista-ordini',
  templateUrl: './lista-ordini.component.html',
  styleUrls: ['./lista-ordini.component.scss'],
  standalone: true,
  imports: [CommonModule, ProdottoOrdineComponent]
})
export class ListaOrdiniComponent implements OnInit {
  @Input() prodotti$!: Observable<OrdProdEstended[]>;

  constructor() {}

  ngOnInit() {}
}
