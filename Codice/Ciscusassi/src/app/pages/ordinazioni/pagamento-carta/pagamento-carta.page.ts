import {
	Component,
	createComponent,
	EnvironmentInjector,
	OnInit,
} from '@angular/core';
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
	IonText,
} from '@ionic/angular/standalone';
import { RicevutaComponent } from 'src/app/components/ricevuta/ricevuta.component';
import { TavoloService } from 'src/app/core/services/tavolo.service';
import { OrdProdEstended } from 'src/app/core/interfaces/OrdProd';

@Component({
	selector: 'app-pagamento-carta',
	templateUrl: './pagamento-carta.page.html',
	styleUrls: ['./pagamento-carta.page.scss'],
	standalone: true,
	imports: [
		IonText,
		IonImg,
		IonButton,
		IonCard,
		IonCol,
		IonRow,
		IonGrid,
		IonContent,
		IonText,
	],
})
export class PagamentoCartaPage implements OnInit {
	carrello: OrdProdEstended[] = [];
	constructor(
		private injector: EnvironmentInjector,
		private tavoloService: TavoloService
	) {}

	ngOnInit() {
		this.ngViewWillEnter();
	}

	ngViewWillEnter() {
		this.carrello = this.tavoloService.getOrdini();
	}

	async generaRicevuta() {
		// Crea dinamicamente il componente RicevutaComponent
		const componentRef = createComponent(RicevutaComponent, {
			environmentInjector: this.injector,
		});

		// Passa i dati necessari al componente dinamico
		componentRef.instance.carrello = this.carrello;
		componentRef.instance.servizio = 'tavolo';

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
}
