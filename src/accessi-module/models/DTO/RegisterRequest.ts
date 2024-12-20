import { StatoRegistrazione } from "../StatoRegistrazione";

export interface RegisterRequest {

    codiceUtente: string,
    username: string,
    statoRegistrazione: StatoRegistrazione,
    chiaveRegistrazione: string,
    campi: string,
    cognome: string,
    nome: string,
    codiceCausaleMovimento: string,
    lingua: string,
    admin: number,
    valori: string,
}