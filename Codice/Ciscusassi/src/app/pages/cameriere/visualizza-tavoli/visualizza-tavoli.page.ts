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
  IonModal
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

  constructor() {}

  ngOnInit(): void {}

  add() {
    this.showPopup = true;
  }

  // Quando clicchi un cerchio:
  selezionaPersone(n: number) {
    this.personeSelezionate = n;
    this.inputManuale = n;  // sincronizza input con selezione cerchio
  }

  // Quando l'utente scrive nell'input:
  onInputChange() {
    if (this.inputManuale !== null && this.personePossibili.includes(this.inputManuale)) {
      // Evidenzia il cerchio corrispondente ma non selezionato tramite click
      this.personeSelezionate = null;
    } else {
      // Se valore non presente, nessun cerchio evidenziato
      this.personeSelezionate = null;
    }
  }

  conferma() {
    // Usa il valore dell'input, se valido
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
}
