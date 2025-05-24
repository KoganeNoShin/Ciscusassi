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
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  ToastController,
} from '@ionic/angular/standalone';

import { ProdottoService } from 'src/app/core/services/prodotto.service';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { ProdottoInput } from 'src/app/core/interfaces/Prodotto';

@Component({
  selector: 'app-modifica-piatti',
  templateUrl: './modifica-piatti.page.html',
  styleUrls: ['./modifica-piatti.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonCard,
    IonLabel,
    IonItem,
    IonIcon,
    IonInput,
    IonTextarea,
    IonTitle,
    IonToolbar,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule,
    IonButton,
  ],
})
export class ModificaPiattiPage implements OnInit {
  p: any = {
    id_prodotto: null,
    nome: '',
    descrizione: '',
    costo: null,
    categoria: '',
    immagine: '',
  };

  categorieDisponibili: string[] = ['ANTIPASTO', 'PRIMO', 'BEVANDA', 'DOLCE'];

  constructor(
    private prodottoService: ProdottoService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    const navigation = window.history.state;
    if (navigation && navigation.piatto) {
      this.p = { ...navigation.piatto };
    }
  }

  async modificaPiatto() {
    if (!this.p.id_prodotto) {
      console.error('ID prodotto mancante, impossibile modificare');
      return;
    }

    const prodottoInput: ProdottoInput = {
      nome: this.p.nome,
      descrizione: this.p.descrizione,
      costo: this.p.costo,
      categoria: this.p.categoria,
      immagine: this.p.immagine,
      is_piatto_giorno: this.p.is_piatto_giorno || false, // Assicurati che is_piatto_giorno sia definito 
    };

    this.prodottoService.updateProdotto(this.p.id_prodotto, prodottoInput).subscribe({
      next: async (response: ApiResponse<void>) => {
        if (response.success) {
          const toast = await this.toastCtrl.create({
            message: 'Piatto modificato con successo',
            duration: 2000,
            color: 'success',
          });
          toast.present();
        } else {
          const toast = await this.toastCtrl.create({
            message: 'Errore: ' + (response.message || 'Modifica fallita'),
            duration: 2000,
            color: 'danger',
          });
          toast.present();
          console.error('Errore nel backend:', response.message);
        }
      },
      error: async (err) => {
        console.error('Errore nella chiamata updateProdotto:', err);
        const toast = await this.toastCtrl.create({
          message: 'Errore di comunicazione col server',
          duration: 2000,
          color: 'danger',
        });
        toast.present();
      },
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.p.immagine = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      alert('Seleziona un file immagine valido.');
    }
  }
}
