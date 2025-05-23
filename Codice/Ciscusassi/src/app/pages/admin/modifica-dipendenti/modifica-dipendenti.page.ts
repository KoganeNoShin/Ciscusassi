import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonChip, IonInput, IonButton, IonIcon, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ImpiegatoRecord } from 'src/app/core/interfaces/Impiegato';
import { ImpiegatoService } from 'src/app/core/services/impiegato.service';

@Component({
  selector: 'app-modifica-dipendenti',
  templateUrl: './modifica-dipendenti.page.html',
  styleUrls: ['./modifica-dipendenti.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonChip,IonInput, IonButton, IonIcon, IonCard, IonImg, IonCardHeader, IonCardTitle, IonCardContent]
})
export class ModificaDipendentiPage implements OnInit {
    dipendenti: ImpiegatoRecord[] = [];
    loading: boolean = true;
    error: boolean = false;

  constructor(private impiegatoService: ImpiegatoService) { }
  private handleResponse(response: ApiResponse<ImpiegatoRecord[]>): void {
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
    this.impiegatoService.GetImpiegati().subscribe({
			next: (response) => this.handleResponse(response),
			error: (err) => {
				console.error(err);
				this.loading = false;
				this.error = true;
			},
		});
  }

}
