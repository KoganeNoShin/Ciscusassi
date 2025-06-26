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

		const container = document.createElement('div');
		container.style.width = '800px';
		container.style.padding = '20px';
		container.style.fontFamily = 'Arial';
		container.style.backgroundColor = '#fff';
		container.style.color = '#000';

		let itemsHTML = `
		<div style="display: flex; font-weight: bold; border-bottom: 1px solid #ccc; padding: 8px 0;">
			<span style="flex: 2;">Prodotto</span>
			<span style="flex: 1; text-align: center;">Quantità</span>
			<span style="flex: 1; text-align: right;">Prezzo</span>
		</div>
	`;

		for (const p of this.prodotti) {
			itemsHTML += `
			<div style="display: flex; border-bottom: 1px solid #eee; padding: 8px 0;">
				<span style="flex: 2;">${p.nome}</span>
				<span style="flex: 1; text-align: center;">${p.quantita}</span>
				<span style="flex: 1; text-align: right;">€ ${(p.quantita * p.prezzo).toFixed(2)}</span>
			</div>
		`;
		}

		container.innerHTML = `
		<div style="text-align: center; margin-bottom: 20px;">
			<img src="${this.logo}" style="max-height: 80px;" />
			<h2>Ricevuta</h2>
			<small>${data}</small>
		</div>

		<div style="margin-bottom: 20px;">
			${itemsHTML}
		</div>

		<div style="text-align: right; font-weight: bold;">
			Totale: € ${totale}
		</div>
	`;

		document.body.appendChild(container);

		// Attendi rendering e caricamento immagine
		await new Promise((resolve) => setTimeout(resolve, 150));
		const logoImg = container.querySelector('img');
		if (logoImg && !logoImg.complete) {
			await new Promise((resolve) => {
				logoImg.onload = resolve;
				logoImg.onerror = resolve;
			});
		}

		const canvas = await html2canvas(container, { scale: 2 });
		const imgData = canvas.toDataURL('image/png');

		const pdf = new jsPDF('p', 'mm', 'a4');
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

		pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
		pdf.save('ricevuta.pdf');

		document.body.removeChild(container);
	}
}
