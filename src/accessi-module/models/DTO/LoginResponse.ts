import { MenuAbilitazioniResult } from "../QueryResults/MenuAbilitazioniResult";
import { UserQueryResult } from "../QueryResults/UserQueryResult";

export interface LoginResponse {
        user: UserQueryResult,
        abilitazioni: MenuAbilitazioniResult[]
}