import { ApiProperty } from '@nestjs/swagger';
import { Permission } from './Permission';

export class AssignPermissionsToUserRequest {
    @ApiProperty({
        description: "Lista delle abilitazioni da assegnare all'utente.",
        type: [Permission],
        example: [
            { codiceMenu: "MNU001", tipoAbilitazione: 30 },
            { codiceMenu: "MNU002", tipoAbilitazione: 10 }
        ]
    })
    permissions: Permission[];
}
