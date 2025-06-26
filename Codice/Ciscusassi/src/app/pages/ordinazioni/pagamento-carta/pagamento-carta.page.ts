import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
	IonContent,
	IonGrid,
	IonRow,
	IonCol,
	IonCard,
	IonCardContent,
	IonButton,
	IonImg,
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-pagamento-carta',
	templateUrl: './pagamento-carta.page.html',
	styleUrls: ['./pagamento-carta.page.scss'],
	standalone: true,
	imports: [
		IonImg,
		IonButton,
		IonCardContent,
		IonCard,
		IonCol,
		IonRow,
		IonGrid,
		IonContent,
	],
})
export class PagamentoCartaPage implements OnInit {
	prodotti = [
		{ nome: 'T-shirt', quantita: 2, prezzo: 15.0 },
		{ nome: 'Jeans', quantita: 1, prezzo: 40.0 },
		{ nome: 'Cappello', quantita: 3, prezzo: 10.0 },
	];

	logo = 'assets/icon/favicon.png';

	constructor() {}

	ngOnInit() {}

	async generaRicevuta() {
		const data = new Date().toLocaleString();
		const totale = this.prodotti
			.reduce((acc, p) => acc + p.quantita * p.prezzo, 0)
			.toFixed(2);

		// Crea un div invisibile nel body per la generazione
		const container = document.createElement('div');
		container.style.width = '800px';
		container.style.padding = '20px';
		container.style.fontFamily = 'Arial';
		container.style.backgroundColor = '#fff';

		container.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${this.logo}" style="max-height: 80px;" />
        <h2>Ricevuta</h2>
        <small>${data}</small>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #ccc;">Prodotto</th>
            <th style="text-align: center; border-bottom: 1px solid #ccc;">Quantità</th>
            <th style="text-align: right; border-bottom: 1px solid #ccc;">Prezzo</th>
          </tr>
        </thead>
        <tbody>
          ${this.prodotti
				.map(
					(p) => `
            <tr>
              <td>${p.nome}</td>
              <td style="text-align: center;">${p.quantita}</td>
              <td style="text-align: right;">€ ${(p.quantita * p.prezzo).toFixed(2)}</td>
            </tr>
          `
				)
				.join('')}
        </tbody>
      </table>

      <div style="text-align: right; font-weight: bold;">
        Totale: € ${totale}
      </div>
    `;

		document.body.appendChild(container); // Aggiungi il div al DOM

		const canvas = await html2canvas(container, { scale: 2 });
		const imgData = canvas.toDataURL('image/png');

		const pdf = new jsPDF('p', 'mm', 'a4');
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

		pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
		pdf.save('ricevuta.pdf');

		document.body.removeChild(container); // Pulisci il DOM
	}
}
