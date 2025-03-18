import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesToUserRequest {
    @ApiProperty({
        description: "Lista dei codici dei ruoli da assegnare all'utente.",
        type: [String],
        example: ["ADMIN", "EDITOR", "USER"]
    })
    roles: string[];
}
