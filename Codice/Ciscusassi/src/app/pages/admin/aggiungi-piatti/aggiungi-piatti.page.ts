import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { HttpClientModule } from '@angular/common/http';

import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ProdottoInput } from 'src/app/core/interfaces/Prodotto';
import { ProdottoService } from 'src/app/core/services/prodotto.service';

@Component({
  selector: 'app-aggiungi-piatti',
  templateUrl: './aggiungi-piatti.page.html',
  styleUrls: ['./aggiungi-piatti.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonCard,
    IonIcon,
    IonInput,
    IonTextarea,
    IonTitle,
    IonToolbar,
    IonButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule,
    HttpClientModule,
  ],
})
export class AggiungiPiattiPage implements OnInit {
  nome: string = '';
  descrizione: string = '';
  costo: number | null = null;
  categoria: string = '';
  immagineBase64: string = '';
  isPiattoGiorno: boolean = false;

  categorieDisponibili: string[] = ['ANTIPASTO', 'PRIMO', 'BEVANDA', 'DOLCE'];

  constructor(private prodottoService: ProdottoService) {}

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.immagineBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  creaPiatto(): void {
  // Validazione campi obbligatori
  if (!this.nome.trim() || !this.categoria || this.costo === null || !this.immagineBase64) {
    alert('⚠️ Tutti i campi obbligatori devono essere compilati.');
    return;
  }

  const nuovoProdotto: ProdottoInput = {
    nome: this.nome.trim(),
    descrizione: this.descrizione?.trim() || '',
    costo: this.costo,
    categoria: this.categoria,
    immagine: this.immagineBase64,
    is_piatto_giorno: this.isPiattoGiorno === true ? true : false, 
  };

  // Esegui la richiesta
  this.prodottoService.addProdotto(nuovoProdotto).subscribe({
    next: (response) => {
      console.log('✅ Risposta dal server:', response);

      // Anche se la risposta non ha un campo 'success', se siamo in next, vuol dire che la chiamata è riuscita
      alert('✅ Piatto creato correttamente.');
      this.resetForm();
    },
    error: (err) => {
      console.error('❌ Errore HTTP:', err);
      alert('❌ Errore durante la creazione del piatto.\nDettagli: ' + (err?.message || 'Errore sconosciuto'));
    },
  });
}

  resetForm(): void {
    this.nome = '';
    this.descrizione = '';
    this.costo = null;
    this.categoria = '';
    this.immagineBase64 = '';
    this.isPiattoGiorno = false;
  }
}
