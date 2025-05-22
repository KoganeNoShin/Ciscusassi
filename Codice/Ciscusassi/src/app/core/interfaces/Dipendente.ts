export interface Dipendente {
  matricola: number; // opzionale perché è autoincrement
  nome: string;
  cognome: string;
  ruolo: string;
  foto: string; // Base64 o URL
  password: string;
  email: string;
  data_nascita: string; // ISO format: YYYY-MM-DD
  ref_filiale: number;
}


