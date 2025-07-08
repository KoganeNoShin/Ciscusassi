import { Component, OnInit, Input } from '@angular/core';

import { IonIcon, IonText } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { chevronDown } from 'ionicons/icons';

// Librerie per permettere di passare html sanificato nel titolo e nella descrizione
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Componente custom utilizzato per creare le prime sezioni delle pagine.
 *
 * Supporta input con tag html per avere un miglior formato.
 *
 * @param title Il titolo della pagina
 * @param description La descrizione della pagina
 * @param backgroundURL Il nome dell'immagine di sfondo (con estensione), l'immagine si deve trovare in `assets/backgrounds`
 */
@Component({
	selector: 'app-hero',
	templateUrl: './hero.component.html',
	styleUrls: ['./hero.component.scss'],
	standalone: true,
	imports: [IonText, IonIcon],
})
export class HeroComponent implements OnInit {
	@Input() title: string = '';
	@Input() description: string = '';
	@Input() backgroundURL: string = '';

	safeTitle: SafeHtml = ''; // Il titolo con eventuale html sanificato
	safeDescription: SafeHtml = ''; // Stessa cosa ma per la descrizione

	constructor(private sanitizer: DomSanitizer) {
		// Rendiamo l'icona utilizzabile nel componente
		addIcons({ chevronDown });
	}

	ngOnInit() {
		this.sanitizeContent();
	}

	/**
	 * Funzione per sanificare il contenuto del titolo e della descrizione passate come parametro
	 */
	sanitizeContent() {
		// Sanifichiamo il titolo
		this.safeTitle = this.sanitizer.bypassSecurityTrustHtml(this.title);

		// Sanifichiamo la descrizione
		this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(
			this.description
		);
	}
}
