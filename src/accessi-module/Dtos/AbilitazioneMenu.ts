import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TipoAbilitazione } from "./TipoAbilitazione";
import { IsEnum, IsNotEmpty, IsString, Length, IsOptional } from "class-validator";

export class AbilitazioneMenu {
  
  @ApiProperty({
    description: 'Codice univoco del menu',
    example: 'MENU_001'
  })
  @IsString()
  @IsNotEmpty({ message: "Il codice menu è obbligatorio." })
  @Length(3, 20, { message: "Il codice menu deve essere tra 3 e 20 caratteri." })
  codiceMenu: string;

  @ApiProperty({
    description: 'Tipo di abilitazione',
    enum: TipoAbilitazione,
    example: TipoAbilitazione.LETTURA
  })
  @IsEnum(TipoAbilitazione, { message: "Il tipo di abilitazione non è valido." })
  tipoAbilitazione: TipoAbilitazione;

  @ApiProperty({
    description: 'Descrizione del menu',
    example: 'Gestione utenti'
  })
  @IsString()
  @IsNotEmpty({ message: "La descrizione del menu è obbligatoria." })
  descrizioneMenu: string;

  @ApiProperty({
    description: 'Descrizione del gruppo a cui appartiene il menu',
    example: 'Amministrazione'
  })
  @IsString()
  @IsNotEmpty({ message: "La descrizione del gruppo è obbligatoria." })
  descrizioneGruppo: string;

  @ApiProperty({
    description: 'Codice univoco del gruppo a cui appartiene il menu',
    example: 'GRP_ADMIN'
  })
  @IsString()
  @IsNotEmpty({ message: "Il codice gruppo è obbligatorio." })
  codiceGruppo: string;

  @ApiPropertyOptional({
    description: 'Nome dell\'icona associata al menu',
    example: 'fa-user'
  })
  @IsString()
  @IsOptional()
  icona: string | null;

  @ApiPropertyOptional({
    description: 'Tipo di menu (es. statico, dinamico, ecc.)',
    example: 'statico'
  })
  @IsString()
  @IsOptional()
  tipo: string | null;

  @ApiPropertyOptional({
    description: 'Percorso della pagina associata al menu',
    example: '/admin/users'
  })
  @IsString()
  @IsOptional()
  pagina: string | null;
}
