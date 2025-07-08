import { Component, OnInit, EnvironmentInjector } from '@angular/core';
import { FilialeAsportoService } from 'src/app/core/services/filiale-asporto.service';
import { CarrelloService } from 'src/app/core/services/carrello.service';
import { RicevutaComponent } from 'src/app/components/ricevuta/ricevuta.component';
import { createComponent } from '@angular/core';

// Librerie per generare la ricevuta in PDF
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import {
	IonButton,
	IonCard,
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
		IonButton,
		IonText,
	],
})
export class RingraziamentiAsportoPage implements OnInit {
	// Informazioni sulla filiale
	filiale: any;

	// Tempo stimato di attesa/preparazione
	tempo: number = 0;

	// Stato attuale del carrello
	carrello = this.servizioCarrello.getProdotti();

	// Costruttore con iniezione dei servizi e dell'injector per componenti dinamici
	constructor(
		private filialeAsportoService: FilialeAsportoService,
		private servizioCarrello: CarrelloService,
		private injector: EnvironmentInjector
	) {}

	// Inizializzazione della pagina
	ngOnInit() {
		// Ottiene la filiale selezionata o più vicina
		this.filiale = this.filialeAsportoService.closestFiliale;

		// Aggiunge 30 minuti al tempo di percorrenza per simulare preparazione ordine
		this.tempo = this.filialeAsportoService.travelTimeMinutes! + 30;
	}

	// Metodo per generare e scaricare la ricevuta in PDF
	async generaRicevuta() {
		// Crea dinamicamente il componente RicevutaComponent
		const componentRef = createComponent(RicevutaComponent, {
			environmentInjector: this.injector,
		});

		// Passa i dati necessari al componente dinamico
		componentRef.instance.carrello = this.carrello;
		componentRef.instance.servizio = 'asporto';

		// Rende effettivi i cambiamenti nel componente
		componentRef.changeDetectorRef.detectChanges();

		// Posiziona il componente fuori dallo schermo per catturarlo
		const element = componentRef.location.nativeElement as HTMLElement;
		element.style.position = 'fixed';
		element.style.top = '-10000px';
		element.style.left = '-10000px';
		element.style.width = '800px';
		element.classList.add('pdf-mode');

		// Aggiunge l’elemento al DOM temporaneamente
		document.body.appendChild(element);

		// Attende il caricamento di eventuali immagini nel componente
		await new Promise((resolve) => {
			const img = element.querySelector('img');
			if (img && !img.complete) {
				img.onload = () => resolve(null);
				img.onerror = () => resolve(null);
			} else {
				resolve(null);
			}
		});

		// Breve delay per garantire il rendering
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Cattura visiva dell’elemento come canvas con alta risoluzione
		const canvas = await html2canvas(element, { scale: 2.5 });

		// Imposta dimensioni A4 in millimetri
		const imgWidth = 210;
		const pageHeight = 297;

		// Crea oggetto PDF con dimensioni e compressione
		const pdf = new jsPDF({
			orientation: 'p',
			unit: 'mm',
			format: 'a4',
			compress: true,
		});

		// Converte altezza pagina da mm a pixel per calcoli successivi
		const pageHeightPx = (canvas.width / imgWidth) * pageHeight;

		let position = 0;

		// Divide il canvas in più pagine se necessario
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
				position, // coordinate origine
				canvas.width,
				pageCanvas.height, // altezza porzione
				0,
				0,
				canvas.width,
				pageCanvas.height // destinazione
			);

			const imgData = pageCanvas.toDataURL('image/jpeg', 0.9);

			// Calcola altezza immagine in millimetri da inserire nel PDF
			const imgHeightMM = (pageCanvas.height * imgWidth) / canvas.width;

			// Aggiunge una nuova pagina se necessario
			if (position > 0) pdf.addPage();
			pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeightMM);

			position += pageCanvas.height;
		}

		// Salva il file PDF
		pdf.save('ricevuta.pdf');

		// Rimuove il componente creato dal DOM e lo distrugge
		document.body.removeChild(element);
		componentRef.destroy();
	}

	// Metodo eseguito alla distruzione del componente (es. uscita dalla pagina)
	ngOnDestroy() {
		// Svuota il carrello alla fine del processo
		this.servizioCarrello.svuotaCarrello();
	}
}
