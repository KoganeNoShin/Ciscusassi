import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { HeroComponent } from 'src/app/components/hero/hero.component';

/**
 * Pagina che viene mostrata quando la rotta cercata non esiste.
 *
 * La particolarità è che viene selezionata una frase random che viene mostrata all'utente.
 */
@Component({
	selector: 'app-not-found',
	templateUrl: './not-found.page.html',
	styleUrls: ['./not-found.page.scss'],
	standalone: true,
	imports: [IonContent, CommonModule, FormsModule, HeroComponent],
})
export class NotFoundPage implements OnInit {
	description: string = ''; // La descrizione che verrà mostrata

	// le frasi che potrebbero uscire dalla funzione di randomizzazione
	frasi: string[] = [
		'La pagina che cerchi ha subito un Black Slash!',
		'Nemmeno la grida di Asta riesce a far tornare questa pagina!',
		'Questa URL è stata bandita dalla Black Bulls per comportamento sospetto!',
		'Hai fatto un incantesimo sbagliato! Torna indietro prima che Magna si arrabbi.',
		'Nemmeno Asta riesce a tagliare una pagina che non esiste!',
		'Questo piatto... ehm, pagina, è ancora in preparazione.',
		'Oops! La ricetta di questa pagina è andata bruciata.',
		'MADA MADA MADAAAA!',
		'AAAAAAAAAAAAAAAAAAAAH!',
	];

	constructor() {}

	ngOnInit() {
		// Randomizziamo un indice
		const randomIndex = Math.floor(Math.random() * this.frasi.length);

		// Assegniamo la descrizione ad una frase in base all'indice randomico
		this.description = this.frasi[randomIndex];
	}
}
