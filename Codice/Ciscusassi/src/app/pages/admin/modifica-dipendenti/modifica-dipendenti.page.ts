import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonChip,
	IonInput,
	IonButton,
	IonIcon,
	IonAlert,
	IonCard,
	IonImg,
	IonCardHeader,
	IonCardTitle,
	IonCardContent,
} from '@ionic/angular/standalone';

import { ToastController } from '@ionic/angular';

import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ImpiegatoRecord } from 'src/app/core/interfaces/Impiegato';
import { ImpiegatoService } from 'src/app/core/services/impiegato.service';

@Component({
	selector: 'app-modifica-dipendenti',
	templateUrl: './modifica-dipendenti.page.html',
	styleUrls: ['./modifica-dipendenti.page.scss'],
	standalone: true,
	imports: [
		IonContent,
		RouterLink,
		IonHeader,
		IonTitle,
		IonButton,
		IonToolbar,
		CommonModule,
		FormsModule,
		IonChip,
		IonInput,
		IonAlert,
		IonButton,
		IonIcon,
		IonCard,
		IonImg,
		IonCardHeader,
		IonCardTitle,
		IonCardContent,
	],
})
export class ModificaDipendentiPage implements OnInit {
	dipendenti: ImpiegatoRecord[] = [];
	loading: boolean = true;
	error: boolean = false;
	selectedCategoria: string = 'Tutti';
	searchTerm: string = '';
	filteredDipendenti: ImpiegatoRecord[] = [];
	id_filiale: number = 0;

	isAlertOpen = false;
	selectedDipendente: ImpiegatoRecord | null = null;

	constructor(
		private impiegatoService: ImpiegatoService,
		private route: ActivatedRoute,
		private router: Router,
		private toastController: ToastController
	) {}

	ngOnInit() {
		this.route.queryParams.subscribe((params) => {
			const idFromQuery = +params['id_filiale'] || 0;
			if (idFromQuery) {
				this.id_filiale = idFromQuery;
				this.fetchImpiegati(this.id_filiale);
			} else {
				const navState = this.router.getCurrentNavigation()?.extras
					?.state as { filialeId?: number };
				if (navState?.filialeId) {
					this.id_filiale = navState.filialeId;
					this.fetchImpiegati(this.id_filiale);
				} else {
					this.loading = false;
					this.error = true;
					console.error(
						'ID filiale non passato alla pagina modifica dipendenti.'
					);
				}
			}
		});
	}

	private fetchImpiegati(filialeId: number) {
		this.impiegatoService.GetImpiegati(filialeId).subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.error(err);
				this.loading = false;
				this.error = true;
			},
		});
	}

	private handleResponse(response: ApiResponse<ImpiegatoRecord[]>): void {
		if (response.success && response.data) {
			this.dipendenti = response.data;
			this.filterTutti();
		} else {
			console.error(response.message || 'Errore sconosciuto');
			this.error = true;
		}

		this.loading = false;
	}

	filterAmministratori() {
		this.selectedCategoria = 'Amministratori';
		this.filteredDipendenti = this.dipendenti.filter(
			(p) => p.ruolo === 'Amministratore'
		);
	}

	filterCamerieri() {
		this.selectedCategoria = 'camerieri';
		this.filteredDipendenti = this.dipendenti.filter(
			(p) => p.ruolo === 'Cameriere'
		);
	}

	filterChef() {
		this.selectedCategoria = 'Chef';
		this.filteredDipendenti = this.dipendenti.filter(
			(p) => p.ruolo === 'Chef'
		);
	}

	filterTutti() {
		this.selectedCategoria = 'Tutti';
		this.filteredDipendenti = this.dipendenti;
	}

	applyFilters() {
		const categoria = this.selectedCategoria.toLowerCase();
		const term = this.searchTerm.trim().toLowerCase();

		this.filteredDipendenti = this.dipendenti.filter((p) => {
			const ruolo = p.ruolo?.toLowerCase() || '';
			const nomeCompleto = `${p.nome} ${p.cognome}`.toLowerCase();
			const email = p.email?.toLowerCase() || '';

			const matchCategoria = categoria === 'tutti' || ruolo === categoria;
			const matchSearch =
				nomeCompleto.includes(term) || email.includes(term);

			return matchCategoria && matchSearch;
		});
	}

	showAlert(dipendente: ImpiegatoRecord) {
		this.selectedDipendente = dipendente;
		this.isAlertOpen = true;
	}

	onConfirm() {
		if (this.selectedDipendente) {
			const matricolaToDelete = this.selectedDipendente.matricola;

			// Rimozione ottimistica dalla lista
			this.dipendenti = this.dipendenti.filter(
				(d) => d.matricola !== matricolaToDelete
			);
			this.applyFilters();

			this.impiegatoService.DeleteImpiegato(matricolaToDelete).subscribe({
				next: () => {
					this.showToastMessage('Dipendente eliminato con successo', 'success');
				},
				error: (err) => {
					console.error('Errore durante la cancellazione:', err);
					this.showToastMessage('Errore durante la cancellazione', 'danger');
				},
			});
		}
		this.isAlertOpen = false;
		this.selectedDipendente = null;
	}

	onCancel() {
		this.isAlertOpen = false;
		this.selectedDipendente = null;
	}

	alertButtons = [
		{
			text: 'Annulla',
			role: 'cancel',
			handler: () => this.onCancel(),
		},
		{
			text: 'OK',
			role: 'confirm',
			handler: () => this.onConfirm(),
		},
	];

	private async showToastMessage(message: string, color: 'success' | 'danger') {
		const toast = await this.toastController.create({
			message,
			duration: 2000,
			color,
			position: 'top',
			animated: true,
			icon: color === 'success' ? 'checkmark-circle' : 'alert-circle'
		});
		await toast.present();
	}
}
