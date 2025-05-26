import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { FilialeService } from 'src/app/core/services/filiale.service';
import { ImpiegatoService } from 'src/app/core/services/impiegato.service';
import { FilialeRecord } from 'src/app/core/interfaces/Filiale';
import { ImpiegatoData } from 'src/app/core/interfaces/Impiegato';

@Component({
  selector: 'app-modifica-dati-dipendenti',
  templateUrl: './modifica-dati-dipendenti.page.html',
  styleUrls: ['./modifica-dati-dipendenti.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonCard,
    IonIcon,
    IonInput,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonSelect,
    IonSelectOption
  ],
})
export class ModificaDatiDipendentiPage implements OnInit {
  nome: string = '';
  cognome: string = '';
  dataNascita: string = '';
  ruolo: string = '';
  foto: string = ''; // base64 immagine
  ref_filiale!: number;
  matricola!: number;

  filiali: FilialeRecord[] = [];

  constructor(
    private router: Router,
    private filialeService: FilialeService,
    private impiegatoService: ImpiegatoService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (
      navigation?.extras?.state &&
      navigation.extras.state['dipendente']
    ) {
      const dip = navigation.extras.state['dipendente'];
      this.matricola = dip.matricola;
      this.nome = dip.nome || '';
      this.cognome = dip.cognome || '';
      this.dataNascita = dip.data_nascita || dip.dataNascita || '';
      this.ruolo = dip.ruolo || '';
      this.foto = dip.foto || dip.image || '';
      this.ref_filiale = dip.ref_filiale;
      // email e password rimossi
    } else {
      console.warn('Nessun dipendente trovato nello stato della navigazione');
    }
    this.caricaFiliali();
  }

  caricaFiliali() {
    this.filialeService.GetSedi().subscribe({
      next: (res) => {
        if (res.data) {
          this.filiali = res.data;
        }
      },
      error: (err) => {
        console.error('Errore caricamento filiali:', err);
        this.presentToast('Errore nel caricamento delle filiali.', 'danger');
      }
    });
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.foto = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  salvaModifiche() {
    if (!this.matricola) {
      this.presentToast('Errore: matricola dipendente non trovata.', 'danger');
      return;
    }

    if (!this.ref_filiale) {
      this.presentToast('Seleziona una filiale.', 'danger');
      return;
    }

    if (!this.nome || !this.cognome || !this.dataNascita || !this.ruolo) {
      this.presentToast('Completa tutti i campi obbligatori.', 'danger');
      return;
    }

    const datiModificati: ImpiegatoData = {
      nome: this.nome,
      cognome: this.cognome,
      data_nascita: this.dataNascita,
      ruolo: this.ruolo,
      foto: this.foto,
      ref_filiale: this.ref_filiale
    };

    this.impiegatoService.UpdateImpiegato(this.matricola, datiModificati).subscribe({
      next: (res) => {
        console.log('Dipendente aggiornato con successo:', res);
        this.presentToast('Dipendente aggiornato con successo!', 'success');
        // qui puoi fare redirect o altre azioni
      },
      error: (err) => {
        console.error('Errore aggiornamento dipendente:', err);
        this.presentToast('Errore durante l\'aggiornamento del dipendente.', 'danger');
      }
    });
  }
}
