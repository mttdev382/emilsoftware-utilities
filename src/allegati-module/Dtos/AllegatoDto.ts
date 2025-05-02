import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class AllegatoDto {

    @ApiProperty({
        description: 'ID univoco dell\'allegato',
        example: 1,
    })
    @IsNumber()
    id: number;

    @ApiProperty({
        description: 'Nome originale del file caricato',
        example: 'documento.pdf',
    })
    @IsString()
    @IsNotEmpty({ message: "Il nome file è obbligatorio." })
    filename: string;

    @ApiProperty({
        description: 'Tipo MIME del file',
        example: 'application/pdf',
    })
    @IsString()
    @IsNotEmpty({ message: "Il tipo MIME è obbligatorio." })
    mimetype: string;

    @ApiProperty({
        description: 'Data di caricamento del file in formato ISO',
        example: '2025-04-27T12:00:00Z',
    })
    @IsString()
    @IsNotEmpty({ message: "La data di upload è obbligatoria." })
    uploadDate: string;
}