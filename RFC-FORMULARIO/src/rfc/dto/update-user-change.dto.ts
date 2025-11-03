import { PartialType, ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { CreateUserChangeDto } from './create-user-change.dto';
import {
  IsArray,
  ArrayMaxSize,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches
} from 'class-validator';

export class UpdateCreateUserChangeDto extends PartialType(
  CreateUserChangeDto
) {
  @ApiProperty({ example: 'Afecta checkout y métricas.' })
  @IsOptional()
  @IsString()
  @Length(3, 4000)
  impact?: string;

  @ApiProperty({ example: '1) Refactor 2) Pruebas 3) Deploy' })
  @IsOptional()
  @IsString()
  @Length(3, 4000)
  implementationPlan?: string;

  @ApiProperty({ example: 'Revertir release y apagar feature flag.' })
  @IsOptional()
  @IsString()
  @Length(3, 4000)
  rollbackPlanning?: string;

  @ApiProperty({ example: 'Smoke + e2e' })
  @IsOptional()
  @IsString()
  @Length(3, 4000)
  testPlanning?: string;

  @ApiProperty({ example: 'lead@dominio.com,qa@dominio.com' })
  @IsOptional()
  @IsString()
  @Length(3, 2000)
  approvers?: string;

  @ApiProperty({ example: '2025-11-10', description: 'YYYY-MM-DD' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate?: string;

  @ApiProperty({ example: '2025-11-20', description: 'YYYY-MM-DD' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  targetDate?: string;

  @ApiPropertyOptional({ example: 'usuario@dominio.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: ['dev1', 'dev2'], description: 'máx: 2' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  assignees?: string[];

  @ApiPropertyOptional({ example: 'qa-lead' })
  @IsOptional()
  @IsString()
  @Length(0, 140)
  reviewer?: string[];
}
