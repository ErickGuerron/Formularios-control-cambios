import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString
} from 'class-validator';

export class CreateRfcDto {
  @ApiProperty({ example: 'RFC: Migrar a Node 20' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Estándar',
    enum: ['Estándar', 'Normal', 'Emergencia']
  })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({ example: 'Medio', enum: ['Bajo', 'Medio', 'Alto'] })
  @IsString()
  @IsNotEmpty()
  riesgo: string;

  @ApiProperty({ example: 'Impacta servicio de autenticación' })
  @IsString()
  @IsOptional()
  impacto?: string;

  @ApiProperty({ example: 'Pasos de implementación...' })
  @IsString()
  @IsOptional()
  plan?: string;

  @ApiProperty({ example: 'Plan de reversa...' })
  @IsString()
  @IsOptional()
  rollback?: string;

  @ApiProperty({ example: 'Plan de pruebas...' })
  @IsString()
  @IsOptional()
  pruebas?: string;

  @ApiProperty({ example: '2025-10-29', required: false, format: 'date' })
  @IsDateString()
  @IsOptional()
  vIni?: string;

  @ApiProperty({ example: '2025-10-29', required: false, format: 'date' })
  @IsDateString()
  @IsOptional()
  vFin?: string;

  @ApiProperty({
    example: 'erickguerron@yahoo.com,aprobador@dominio.com',
    required: false
  })
  @IsString()
  @IsOptional()
  aprobadores?: string;

  @ApiProperty({ example: '1', description: 'Solicitante (texto en Project)' })
  @IsString()
  @IsNotEmpty()
  solicitante: string;

  @ApiProperty({
    example: ['ErickGuerron'],
    description: 'Usuarios a asignar en la Issue'
  })
  @IsArray()
  @IsOptional()
  assignees?: string[];
}
