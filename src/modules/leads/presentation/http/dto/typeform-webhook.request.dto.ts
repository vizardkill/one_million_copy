import { Type } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateLeadRequestDto } from './create-lead.request.dto';

export class TypeformWebhookRequestDto {
  @ApiPropertyOptional({ example: 'evt_01hxm3w9' })
  @IsOptional()
  @IsString()
  event_id?: string;

  @ApiPropertyOptional({ example: 'frm_abc123' })
  @IsOptional()
  @IsString()
  form_id?: string;

  @ApiPropertyOptional({ example: '2026-05-18T14:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  submitted_at?: string;

  @ApiProperty({ type: CreateLeadRequestDto })
  @ValidateNested()
  @Type(() => CreateLeadRequestDto)
  lead!: CreateLeadRequestDto;
}
