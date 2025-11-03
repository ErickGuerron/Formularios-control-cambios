import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsArray // Importa IsArray
} from 'class-validator';

export class CreateUserChangeDto {
  @ApiProperty({
    example: 'Formulario de Solicitud de Usuario',
    maxLength: 40
  })
  @IsString()
  @Length(3, 40) // Ajustado al límite del formulario
  formName!: string;

  @ApiProperty({ example: 'Formulario de Solicitud de Usuario' })
  @IsString()
  @Length(3, 140)
  title!: string; // El frontend envía 'formName' como 'title'

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

  @ApiProperty({ example: '2025-11-03', description: 'YYYY-MM-DD' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  requestDate!: string; // El frontend genera esta fecha

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

  @ApiPropertyOptional({ example: 'Adjuntar evidencia en PR.' })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  notes?: string;

  @ApiPropertyOptional({
    example: [],
    description: 'Array of assignees, sent as empty by default.'
  })
  @IsOptional()
  @IsArray()
  assignees?: string[];
}
