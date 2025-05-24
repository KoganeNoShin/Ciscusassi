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
    CommonModule,
    FormsModule,
    IonButton,
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
    if (!this.nome || !this.categoria || this.costo === null || !this.immagineBase64) {
      alert('Compila tutti i campi obbligatori!');
      return;
    }

    const nuovoProdotto: ProdottoInput = {
      nome: this.nome,
      descrizione: this.descrizione,
      costo: this.costo,
      categoria: this.categoria,
      immagine: this.immagineBase64,
      is_piatto_giorno: false, // Impostazione predefinita, può essere modificata in seguito
    };

    this.prodottoService.addProdotto(nuovoProdotto).subscribe({
      next: () => {
        alert('Piatto creato con successo!');
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Errore nella creazione del piatto:', err);
        alert('Errore durante la creazione del piatto.');
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
