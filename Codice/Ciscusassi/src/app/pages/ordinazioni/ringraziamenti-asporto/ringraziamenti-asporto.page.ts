// src/app/pages/ordinazioni/ringraziamenti-asporto/ringraziamenti-asporto.page.ts
import { Component, OnInit, EnvironmentInjector } from '@angular/core';
import { FilialeAsportoService } from 'src/app/core/services/filiale-asporto.service';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { RicevutaComponent } from 'src/app/components/ricevuta/ricevuta.component';
import { createComponent } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
	IonButton,
	IonCard,
	IonCardContent,
	IonCol,
	IonContent,
	IonGrid,
	IonImg,
	IonRow,
	IonText,
} from '@ionic/angular/standalone';

@Component({
	selector: 'app-ringraziamenti-asporto',
	templateUrl: './ringraziamenti-asporto.page.html',
	styleUrls: ['./ringraziamenti-asporto.page.scss'],
	imports: [
		IonContent,
		IonGrid,
		IonRow,
		IonCol,
		IonImg,
		IonCard,
		IonCardContent,
		IonButton,
		IonText,
	],
})
export class RingraziamentiAsportoPage implements OnInit {
	filiale: any;
	tempo: number = 0;
	carrello = this.servizioCarrello.getProdotti();

	constructor(
		private filialeAsportoService: FilialeAsportoService,
		private servizioCarrello: CarrelloService,
		private injector: EnvironmentInjector
	) {}

	ngOnInit() {
		this.filiale = this.filialeAsportoService.closestFiliale;

		// Aggiungiamo 30 minuti perché così diamo l'illusione del tempo di preparazione
		this.tempo = this.filialeAsportoService.travelTimeMinutes! + 30;
	}

	async generaRicevuta() {
		// Crea componente standalone dinamicamente
		const componentRef = createComponent(RicevutaComponent, {
			environmentInjector: this.injector,
		});

		componentRef.instance.carrello = this.carrello;
		componentRef.instance.logo = 'assets/icon/logo.png';

		componentRef.changeDetectorRef.detectChanges();

		const element = componentRef.location.nativeElement as HTMLElement;
		element.style.position = 'fixed';
		element.style.top = '-10000px';
		element.style.left = '-10000px';
		element.style.width = '800px';
		element.classList.add('pdf-mode');

		document.body.appendChild(element);

		await new Promise((resolve) => {
			const img = element.querySelector('img');
			if (img && !img.complete) {
				img.onload = () => resolve(null);
				img.onerror = () => resolve(null);
			} else {
				resolve(null);
			}
		});
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Step 1: Cattura intero canvas
		const canvas = await html2canvas(element, { scale: 2.5 });
		const imgWidth = 210; // A4 larghezza in mm
		const pageHeight = 297; // A4 altezza in mm

		const pdf = new jsPDF({
			orientation: 'p',
			unit: 'mm',
			format: 'a4',
			compress: true,
		});

		// Step 2: Calcola la scala in px per 1mm nel PDF
		const pageHeightPx = (canvas.width / imgWidth) * pageHeight;

		let position = 0;

		while (position < canvas.height) {
			const pageCanvas = document.createElement('canvas');
			pageCanvas.width = canvas.width;
			pageCanvas.height = Math.min(
				pageHeightPx,
				canvas.height - position
			);

			const ctx = pageCanvas.getContext('2d');
			ctx?.drawImage(
				canvas,
				0,
				position, // source x,y
				canvas.width,
				pageCanvas.height, // source width,height
				0,
				0,
				canvas.width,
				pageCanvas.height // destination
			);

			const imgData = pageCanvas.toDataURL('image/jpeg', 0.9);
			const imgHeightMM = (pageCanvas.height * imgWidth) / canvas.width;

			if (position > 0) pdf.addPage();
			pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeightMM);

			position += pageCanvas.height;
		}

		pdf.save('ricevuta.pdf');

		// Cleanup
		document.body.removeChild(element);
		componentRef.destroy();
	}

	ngOnDestroy() {
		this.servizioCarrello.svuotaCarrello();
	}
}
