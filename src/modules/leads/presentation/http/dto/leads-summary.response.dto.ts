import { ApiProperty } from '@nestjs/swagger';

export class LeadsSummaryResponseDto {
  @ApiProperty({
    example:
      'Resumen ejecutivo: ... Fuente principal: instagram ... Recomendaciones: ...',
  })
  summary!: string;
}
