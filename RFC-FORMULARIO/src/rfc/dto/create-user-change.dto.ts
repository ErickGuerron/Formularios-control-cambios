import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches
} from 'class-validator';

export class CreateUserChangeDto {
  @ApiProperty({ example: 'SCR 2025-11' })
  @IsString()
  @Length(3, 100)
  formName!: string;

  @ApiProperty({ example: 'SCR | Ajuste de validación en perfil' })
  @IsString()
  @Length(3, 140)
  title!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @Length(3, 140)
  requesterName!: string;

  @ApiPropertyOptional({ example: 'Finanzas' })
  @IsOptional()
  @IsString()
  @Length(0, 140)
  department?: string;

  @ApiProperty({ example: 'juan.perez@empresa.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '2025-11-02', description: 'YYYY-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  requestDate!: string;

  @ApiProperty({
    example: 'Mejora funcional',
    enum: ['Corrección de error', 'Mejora funcional', 'Cambio estético', 'Otro']
  })
  @IsString()
  changeType!:
    | 'Corrección de error'
    | 'Mejora funcional'
    | 'Cambio estético'
    | 'Otro';

  @ApiProperty({ example: 'Validar longitud del campo teléfono.' })
  @IsString()
  @Length(3, 4000)
  description!: string;

  @ApiProperty({ example: 'Evitar registros inválidos y retrabajo.' })
  @IsString()
  @Length(3, 4000)
  reason!: string;

  @ApiProperty({ example: 'Media', enum: ['Alta', 'Media', 'Baja'] })
  @IsString()
  priorityName!: 'Alta' | 'Media' | 'Baja';

  @ApiPropertyOptional({ example: '2025-11-15', description: 'YYYY-MM-DD' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  desiredDate?: string;

  @ApiPropertyOptional({ example: 'Adjuntar evidencia en PR.' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;
}
