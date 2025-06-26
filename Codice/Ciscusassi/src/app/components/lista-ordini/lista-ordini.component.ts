import { Component, OnInit, Input } from '@angular/core';
import { ProdottoOrdineComponent } from '../prodotto-ordine/prodotto-ordine.component';
import { ProdottoRecord } from 'src/app/core/interfaces/Prodotto';

@Component({
  selector: 'app-lista-ordini',
  templateUrl: './lista-ordini.component.html',
  styleUrls: ['./lista-ordini.component.scss'],
  imports: [ProdottoOrdineComponent],
  standalone: true,
})
export class ListaOrdiniComponent  implements OnInit {
  @Input() prodotti: ProdottoRecord[] = []; 
  
  constructor() { }

  ngOnInit() {  }

}
