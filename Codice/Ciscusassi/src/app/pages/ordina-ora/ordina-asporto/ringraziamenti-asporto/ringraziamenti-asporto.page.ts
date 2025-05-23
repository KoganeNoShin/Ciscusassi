import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilialeAsportoService } from 'src/app/core/services/filiale-asporto.service';
import {
	IonContent,
	IonHeader,
	IonTitle,
	IonToolbar,
	IonCard,
	IonGrid,
	IonRow,
	IonCol,
	IonCardContent,
	IonButton,
  IonImg, 
  IonText
} from '@ionic/angular/standalone';


@Component({
	selector: 'app-ringraziamenti-asporto',
	templateUrl: './ringraziamenti-asporto.page.html',
	styleUrls: ['./ringraziamenti-asporto.page.scss'],
	standalone: true,
	imports: [
    IonCardContent,
    IonCol,
    IonRow,
    IonCard,
    IonContent,
    CommonModule,
    FormsModule,
    IonGrid,
    IonImg
],
})
export class RingraziamentiAsportoPage implements OnInit {
	constructor(private filialeAsportoService: FilialeAsportoService) {	}
	filiale: any;
	tempo: any;


	ngOnInit() {
		this.filiale = this.filialeAsportoService.closestFiliale;
		this.tempo = this.filialeAsportoService.travelTimeMinutes;
		console.log('Filiale più vicina:', this.filiale);
		console.log('Tempo stimato:', this.tempo, 'minuti');
	}

}


