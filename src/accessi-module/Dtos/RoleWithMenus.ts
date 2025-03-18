import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoAbilitazione } from './TipoAbilitazione';
import { MenuItem } from './MenuItem';

export class RoleWithMenus {
    @ApiPropertyOptional({ description: 'Codice univoco del ruolo', required: false })
    codiceRuolo?: string;

    @ApiProperty({ description: 'Descrizione del ruolo' })
    descrizioneRuolo: string;

    @ApiProperty({
        description: 'Lista di menù associati al ruolo',
        type: [MenuItem]
    })
    menu: MenuItem[];
}