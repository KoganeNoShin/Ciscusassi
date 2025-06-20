import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonModal,
  ToastController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-visualizza-tavoli',
  templateUrl: './visualizza-tavoli.page.html',
  styleUrls: ['./visualizza-tavoli.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonModal,
    CommonModule,
    FormsModule,
  ],
})
export class VisualizzaTavoliPage implements OnInit {
  tavoli = [
    { numero: 1, nome: 'Susino', orario: '20-22', persone: 4, stato: 'in-consegna' },
    { numero: 2, nome: 'Gaetaní', orario: '19-21', persone: 8, stato: 'consegnato' },
    { numero: 3, nome: 'Luna', orario: '19-20', persone: 6, stato: 'attesa' },
    { numero: 4, nome: 'Bianco1', orario: '22-23', persone: 3, stato: 'senza-ordini' },
    { numero: 5, nome: 'Bianco2', orario: '20-21', persone: 2, stato: 'senza-ordini' }
  ];

  legenda = [
    { stato: 'in-consegna', label: 'IN CONSEGNA' },
    { stato: 'consegnato', label: 'CONSEGNATO' },
    { stato: 'attesa', label: 'NON IN LAVORAZIONE' },
    { stato: 'preparazione', label: 'IN LAVORAZIONE' },
    { stato: 'senza-ordini', label: 'SENZA ORDINI' }
  ];

  showPopup = false;
  personePossibili = [1, 2, 3, 4, 5, 6, 7];
  personeSelezionate: number | null = null;
  inputManuale: number | null = null;

  constructor(private toastController: ToastController) {}

  ngOnInit(): void {}

  add() {
    this.showPopup = true;
  }

  selezionaPersone(n: number) {
    this.personeSelezionate = n;
    this.inputManuale = n;
  }

  onInputChange() {
    if (this.inputManuale !== null && this.personePossibili.includes(this.inputManuale)) {
      this.personeSelezionate = null;
    } else {
      this.personeSelezionate = null;
    }
  }

  conferma() {
    const persone = this.inputManuale;

    if (!persone || persone < 1) {
      alert("Inserisci un numero valido di persone");
      return;
    }

    const nuovoNumero = this.generaIdUnivoco();
    const nuovoTavolo = {
      numero: nuovoNumero,
      nome: `Tavolo ${nuovoNumero}`,
      orario: '--:--',
      persone,
      stato: 'senza-ordini'
    };

    this.tavoli.push(nuovoTavolo);
    this.presentToast(`Aggiunto Tavolo #${nuovoNumero} con ${persone} persone`);
    this.showPopup = false;
    this.resetPopup();
  }

  annulla() {
    this.showPopup = false;
    this.resetPopup();
  }

  resetPopup() {
    this.personeSelezionate = null;
    this.inputManuale = null;
  }

  generaIdUnivoco(): number {
    const idsEsistenti = this.tavoli.map(t => t.numero);
    return Math.max(...idsEsistenti, 0) + 1;
  }

  /**
   * Verifica se un tavolo è cliccabile in base al suo stato.
   */
  isCliccabile(tavolo: any): boolean {
    return tavolo.stato !== 'senza-ordini';
  }

  /**
   * Gestisce il click su un tavolo, solo se è cliccabile.
   */
  handleClick(tavolo: any) {
    if (this.isCliccabile(tavolo)) {
      console.log('Hai cliccato sul tavolo:', tavolo);
      // Qui puoi aprire una pagina di dettaglio, mostrare un popup, ecc.
    }
  }

  /**
   * Mostra un messaggio toast.
   */
  async presentToast(messaggio: string) {
    const toast = await this.toastController.create({
      message: messaggio,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }
}
