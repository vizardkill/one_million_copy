import { ApiProperty } from '@nestjs/swagger';
import { LeadSource } from '../../../domain/enums/lead-source.enum';

export class LeadsBySourceResponseDto {
  @ApiProperty({ enum: LeadSource })
  fuente!: LeadSource;

  @ApiProperty()
  total!: number;
}

export class LeadsStatsResponseDto {
  @ApiProperty()
  total_leads!: number;

  @ApiProperty({ type: [LeadsBySourceResponseDto] })
  leads_por_fuente!: LeadsBySourceResponseDto[];

  @ApiProperty({ nullable: true, example: 870.5 })
  promedio_presupuesto_usd!: number | null;

  @ApiProperty()
  leads_ultimos_7_dias!: number;
}
