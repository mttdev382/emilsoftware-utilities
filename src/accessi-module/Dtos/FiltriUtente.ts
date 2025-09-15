import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class FiltriUtente {

  @ApiProperty({
    description: 'Progressivo identificativo del filtro',
    example: 1
  })
  @IsInt({ message: "Il progressivo deve essere un numero intero." })
  @Min(1, { message: "Il progressivo deve essere maggiore di 0." })
  progressivo?: number;

  @ApiProperty({
    description: 'Numero del report associato',
    example: 1002
  })
  @IsInt({ message: "Il numero del report deve essere un numero intero." })
  numeroReport?: number;

  @ApiProperty({
    description: 'Indice personale dell\'utente',
    example: 15
  })
  @IsInt({ message: "L'indice personale deve essere un numero intero." })
  indicePersonale?: number;

  @ApiPropertyOptional({
    description: 'Codice del cliente principale (super)',
    example: 'CLT_SUP_1234'
  })
  @IsString()
  @IsOptional()
  codiceClienteSuper?: string | null;

  @ApiPropertyOptional({
    description: 'Codice dell\'agenzia associata',
    example: 'AGZ_5678'
  })
  @IsString()
  @IsOptional()
  codiceAgenzia?: string;

  @ApiPropertyOptional({
    description: 'Codice del cliente collegato',
    example: 'CLT_COL_8765'
  })
  @IsString()
  @IsOptional()
  codiceClienteCollegato?: string;

  @ApiPropertyOptional({
    description: 'Lista di codici clienti separati da virgola',
    example: 'CLT_123,CLT_456,CLT_789'
  })
  @IsString()
  @IsOptional()
  codiceClienti?: string;

  @ApiPropertyOptional({
    description: 'Tipo di filtro applicato',
    example: 'esclusivo'
  })
  @IsString()
  @IsOptional()
  tipoFiltro?: number;
}
