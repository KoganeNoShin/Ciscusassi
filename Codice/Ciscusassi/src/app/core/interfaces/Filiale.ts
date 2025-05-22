export interface FilialeInput {
    comune: string;
    indirizzo: string;
    num_tavoli: number;
    longitudine: number;
    latitudine: number;
    immagine: string;
}

export interface FilialeRecord extends FilialeInput {
    id_filiale: number;
}