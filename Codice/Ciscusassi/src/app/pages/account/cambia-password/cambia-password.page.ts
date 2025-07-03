import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonGrid,
  IonCol,
  IonRow,
  IonImg,
  IonCard,
  IonText,
  IonButton,
  IonItem,
  IonSpinner,
  IonInputPasswordToggle,
  IonAvatar,
} from '@ionic/angular/standalone';

import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import {
  LoginRecord,
  OurTokenPayload,
  RegistrationData,
} from 'src/app/core/interfaces/Credentials';
import { ApiResponse } from 'src/app/core/interfaces/ApiResponse';
import { IonInput } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { inject } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { image } from 'ionicons/icons';

@Component({
  selector: 'app-cambia-password',
  templateUrl: './cambia-password.page.html',
  styleUrls: ['./cambia-password.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonSpinner,
    IonItem,
    IonButton,
    IonText,
    IonCard,
    IonImg,
    IonRow,
    IonCol,
    IonGrid,
    IonContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonInput,
    IonInputPasswordToggle,
  ],
})
export class CambiaPasswordPage implements OnInit {
  formCambiaPassword: FormGroup = new FormGroup({});
  error: boolean = false;
  loading: boolean = false;
  errorMsg: string = '';
  pagina: number = 0;
  nuovaPassword: string ='';
  confermaPassword: string ='';

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private router: Router,
    private toastController: ToastController,
  ) {}

  private handleResponse(response: ApiResponse<any>): void {
    console.log(response);
    if (response.success) {
      this.presentToast('Password modificata con successo', 'success');
      this.router.navigate(['/dati-account']);
    } else {
      this.errorMsg = response.message || 'Errore durante la modifica della password.';
      this.error = true;
    }
  }
  ngOnInit() {
    this.formCambiaPassword = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{6,}$'
            ),
          ],
        ],
        confermaPassword: ['', Validators.required],
      },
      {
        validators: this.matchPassword(),
      }
    );
  }

  async onSubmit() {
    this.loading = true;

    if (this.formCambiaPassword.valid) {
      this.nuovaPassword =
        this.formCambiaPassword.value.password;
      this.confermaPassword =
        this.formCambiaPassword.value.confermaPassword;

        this.authenticationService
          .cambiaPassword(this.nuovaPassword, this.confermaPassword)
          .subscribe({
            next: (response) => this.handleResponse(response),
            error: (err) => {
              this.errorMsg =
                'Errore durante la modifica della password';
              console.log(err);
              this.error = true;
              this.loading = false;
            },
          });
    }
  }

  matchPassword(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('password')?.value;
      const conferma = group.get('confermaPassword')?.value;
      return password === conferma ? null : { passwordMismatch: true };
    };
  }

  async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning'
  ) {
    // Mostra un toast di notifica con messaggio e colore specificati
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });
    toast.present();
  }
}
