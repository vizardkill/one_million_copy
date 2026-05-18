import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { LeadSource } from '../../../domain/enums/lead-source.enum';

export class LeadsSummaryRequestDto {
  @ApiPropertyOptional({ enum: LeadSource, example: LeadSource.FACEBOOK })
  @IsOptional()
  @IsEnum(LeadSource)
  fuente?: LeadSource;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;
}
