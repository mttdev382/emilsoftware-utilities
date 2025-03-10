import { TipoAbilitazione } from "../../Services/PermissionService/IPermissionService";

export interface MenuAbilitazioniResult {
    codiceMnu: string;
    tipoAbilitazione: TipoAbilitazione;
    descrizioneMnu: string;
    descrizioneGrp: string;
    codiceGrp: string;
    icon?: string;
    codiceTipo: string;
    pagina: string;
}