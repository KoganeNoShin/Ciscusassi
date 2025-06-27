// src/app/pages/ordinazioni/ringraziamenti-asporto/ringraziamenti-asporto.page.ts
import {
	Component,
	OnInit,
	EnvironmentInjector,
	ApplicationRef,
	Injector,
} from '@angular/core';
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
	],
})
export class RingraziamentiAsportoPage implements OnInit {
	filiale: any;
	tempo: any;
	carrello = this.servizioCarrello.getProdotti();

	constructor(
		private filialeAsportoService: FilialeAsportoService,
		private servizioCarrello: CarrelloService,
		private injector: EnvironmentInjector,
		private appRef: ApplicationRef,
		private injectorService: Injector
	) {}

	ngOnInit() {
		this.filiale = this.filialeAsportoService.closestFiliale;
		this.tempo = this.filialeAsportoService.travelTimeMinutes;
	}

	async generaRicevuta() {
		// Crea componente standalone dinamicamente
		const componentRef = createComponent(RicevutaComponent, {
			environmentInjector: this.injector,
		});

		// Passa i dati necessari
		componentRef.instance.carrello = this.carrello;
		componentRef.instance.logo = 'assets/icon/logo.png'; // imposta il path corretto del logo

		componentRef.changeDetectorRef.detectChanges();

		// Ottieni il DOM element
		const element = componentRef.location.nativeElement as HTMLElement;

		// Applica stile e classe PDF
		element.style.position = 'fixed';
		element.style.top = '-10000px';
		element.style.left = '-10000px';
		element.style.width = '800px';
		element.classList.add('pdf-mode');

		// Aggiungi al DOM
		document.body.appendChild(element);

		// Aspetta che l'immagine venga caricata
		await new Promise((resolve) => {
			const img = element.querySelector('img');
			if (img && !img.complete) {
				img.onload = () => resolve(null);
				img.onerror = () => resolve(null);
			} else {
				resolve(null);
			}
		});

		// Aspetta un attimo per sicurezza
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Cattura con html2canvas
		const canvas = await html2canvas(element, { scale: 2 });
		const imgData = canvas.toDataURL('image/png');

		// Genera PDF
		const pdf = new jsPDF('p', 'mm', 'a4');
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
		pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
		pdf.save('ricevuta.pdf');

		// Pulisci
		document.body.removeChild(element);
		componentRef.destroy();
	}

	ngOnDestroy() {
		this.servizioCarrello.svuotaCarrello();
	}
}
