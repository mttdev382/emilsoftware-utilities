import { MenuAbilitazioniResult } from "../QueryResults/MenuAbilitazioniResult";
import { UserQueryResult } from "../QueryResults/UserQueryResult";

export interface LoginResponse {
        token: {
                expiresIn: string,
                value: string,
                type: string
        },
        user: UserQueryResult,
        abilitazioni: MenuAbilitazioniResult[]
}