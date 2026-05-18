import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { LeadSource } from '../../../domain/enums/lead-source.enum';

export class CreateLeadRequestDto {
  @ApiProperty({ example: 'Laura Mendoza', minLength: 2, maxLength: 120 })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nombre!: string;

  @ApiProperty({ example: 'laura@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+573001112233', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @ApiProperty({ enum: LeadSource, example: LeadSource.INSTAGRAM })
  @IsEnum(LeadSource)
  fuente!: LeadSource;

  @ApiPropertyOptional({ example: 'Curso de copywriting', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  producto_interes?: string;

  @ApiPropertyOptional({ example: 450, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  presupuesto?: number;
}
