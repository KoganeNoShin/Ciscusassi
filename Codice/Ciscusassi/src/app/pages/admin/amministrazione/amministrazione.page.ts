import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { RouterModule } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/authentication.service';

@Component({
	selector: 'app-amministrazione',
	templateUrl: './amministrazione.page.html',
	styleUrls: ['./amministrazione.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		IonGrid,
		IonRow,
		IonCol,
		IonImg,
		IonCard,
		IonButton,
		CommonModule,
		FormsModule,
		RouterModule,
		IonText,
	],
})
export class AmministrazionePage implements OnInit {
	username: string = '';

	constructor(private authService: AuthenticationService) {}

	/**
	 * Inizializza il componente sottoscrivendosi allo stream `username$` del servizio di autenticazione.
	 *
	 * Recupera il nome utente corrente e lo assegna alla proprietà `username` ogni volta che cambia.
	 *
	 * @returns {void}
	 *
	 * @remarks
	 * - Questo metodo viene eseguito automaticamente all’inizializzazione del componente.
	 * - Utilizza `username$`, uno stream `Observable<string>` che emette il nome utente autenticato.
	 * - La sottoscrizione consente di mantenere sincronizzata la proprietà `username` con i dati del servizio.
	 */
	ngOnInit() {
		this.authService.username$.subscribe((username) => {
			this.username = username;
		});
	}
}
