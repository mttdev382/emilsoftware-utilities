import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class LoginRequest {
    
    @ApiProperty({
        description: 'Username dell\'utente',
        example: 'mario.rossi'
    })
    @IsString({ message: "L'username deve essere una stringa." })
    @Length(3, 50, { message: "L'username deve essere tra 3 e 50 caratteri." })
    username: string;

    @ApiProperty({
        description: 'Password dell\'utente',
        example: 'Str0ngP@ssw0rd!'
    })
    @IsString({ message: "La password deve essere una stringa." })
    @Length(8, 100, { message: "La password deve essere tra 8 e 100 caratteri." })
    password: string;
}
