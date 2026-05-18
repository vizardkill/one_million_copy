import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateLeadRequestDto {
  @ApiPropertyOptional({ example: 'Laura Mendoza Actualizada' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nombre?: string;

  @ApiPropertyOptional({ example: 'laura.nueva@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+573001112233' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @ApiPropertyOptional({ enum: LeadSource, example: LeadSource.FACEBOOK })
  @IsOptional()
  @IsEnum(LeadSource)
  fuente?: LeadSource;

  @ApiPropertyOptional({ example: 'Mentoria de embudos' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  producto_interes?: string;

  @ApiPropertyOptional({ example: 980, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  presupuesto?: number;
}
