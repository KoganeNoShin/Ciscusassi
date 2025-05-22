import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonChip, IonInput, IonButton, IonIcon, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { Dipendente } from 'src/app/core/interfaces/Dipendente';
import { ServiceDipendentiService } from 'src/app/core/services/service-dipendenti.service';

@Component({
  selector: 'app-modifica-dipendenti',
  templateUrl: './modifica-dipendenti.page.html',
  styleUrls: ['./modifica-dipendenti.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonChip,IonInput, IonButton, IonIcon, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardContent]
})
export class ModificaDipendentiPage implements OnInit {
    dipendenti: Dipendente[] = [];
    loading: boolean = true;
    error: boolean = false;

  constructor(private serviceDipendentiService: ServiceDipendentiService) { }
  private handleResponse(response: ApiResponse<Dipendente[]>): void {
      console.log(response);
  
      if (response.success && response.data) {
        this.dipendenti = response.data;
      } else {
        console.error(response.message || 'Errore sconosciuto');
        this.error = true;
      }
  
      this.loading = false;
    }

  ngOnInit() {
    this.serviceDipendentiService.GetDipendenti().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.error(err);
				this.loading = false;
				this.error = true;
			},
		});
  }

}
