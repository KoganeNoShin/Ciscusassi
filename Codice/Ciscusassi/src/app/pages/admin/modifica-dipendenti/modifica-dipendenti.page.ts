import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonChip, IonInput, IonButton, IonIcon, IonAlert, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ImpiegatoRecord } from 'src/app/core/interfaces/Impiegato';
import { ImpiegatoService } from 'src/app/core/services/impiegato.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-modifica-dipendenti',
  templateUrl: './modifica-dipendenti.page.html',
  styleUrls: ['./modifica-dipendenti.page.scss'],
  standalone: true,
  imports: [IonContent, RouterLink, IonHeader, IonTitle, IonButton, IonToolbar, CommonModule, FormsModule, IonChip,IonInput, IonAlert, IonButton, IonIcon, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardContent]
})
export class ModificaDipendentiPage implements OnInit {
    dipendenti: ImpiegatoRecord[] = [];
    loading: boolean = true;
    error: boolean = false;
    selectedCategoria: string = 'Tutti';
   	searchTerm: string = '';
    filteredDipendenti: ImpiegatoRecord[] = [];

  constructor(private impiegatoService: ImpiegatoService) { }
  private handleResponse(response: ApiResponse<ImpiegatoRecord[]>): void {
      console.log(response);
  
      if (response.success && response.data) {
        this.dipendenti = response.data;
        this.filterTutti(); 
      } else {
        console.error(response.message || 'Errore sconosciuto');
        this.error = true;
      }
  
      this.loading = false;
    }

  ngOnInit() {
    this.impiegatoService.GetImpiegati().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.error(err);
				this.loading = false;
				this.error = true;
			},
		});
  }

  filterAmministratori() {
    this.selectedCategoria = 'Amministratori';
    this.filteredDipendenti = this.dipendenti.filter(p => p.ruolo === 'Amministratore');
  }

  filterCamerieri() {
    this.selectedCategoria = 'camerieri';
    this.filteredDipendenti = this.dipendenti.filter(p => p.ruolo === 'Cameriere');
  }

  filterChef() {
    this.selectedCategoria = 'Chef';
    this.filteredDipendenti = this.dipendenti.filter(p => p.ruolo === 'Chef');
  }

  filterTutti() {
    this.selectedCategoria = 'Tutti';
    this.filteredDipendenti = this.dipendenti;
  }

 applyFilters() {
  const categoria = this.selectedCategoria.toLowerCase();
  const term = this.searchTerm.trim().toLowerCase();

  this.filteredDipendenti = this.dipendenti.filter(p => {
    const ruolo = p.ruolo?.toLowerCase() || '';
    const nomeCompleto = `${p.nome} ${p.cognome}`.toLowerCase();
    const email = p.email?.toLowerCase() || '';

    const matchCategoria =
      categoria === 'tutti' || ruolo === categoria;

    const matchSearch =
      nomeCompleto.includes(term) || email.includes(term);

    return matchCategoria && matchSearch;
  });
}
  isAlertOpen = false;
  selectedDipendente: ImpiegatoRecord | null = null;

  showAlert(dipendente: ImpiegatoRecord) {
    this.selectedDipendente = dipendente;
    this.isAlertOpen = true;
  }

  onConfirm() {
    if (this.selectedDipendente) {
      console.log('Confermata rimozione filiale:', this.selectedDipendente);
      // Qui puoi chiamare il servizio per rimuovere la filiale, per esempio:
      // this.filialiServiceService.rimuoviFiliale(this.selectedFiliale.id_filiale).subscribe(...);
      // Poi aggiorna la lista, rimuovendo la filiale localmente o rifacendo la fetch
    }
    this.isAlertOpen = false;
    this.selectedDipendente= null;
  }

  onCancel() {
    console.log('Rimozione annullata');
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

}
