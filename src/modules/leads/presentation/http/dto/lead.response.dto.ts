import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadSource } from '../../../domain/enums/lead-source.enum';

export class LeadResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  email!: string;

  @ApiPropertyOptional({ nullable: true })
  telefono!: string | null;

  @ApiProperty({ enum: LeadSource })
  fuente!: LeadSource;

  @ApiPropertyOptional({ nullable: true })
  producto_interes!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 450 })
  presupuesto!: number | null;

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;

  @ApiPropertyOptional({ nullable: true })
  deleted_at!: string | null;
}
