import { ApiProperty } from '@nestjs/swagger';
import { LeadResponseDto } from './lead.response.dto';

export class LeadsPaginationDto {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  total_pages!: number;
}

export class ListLeadsResponseDto {
  @ApiProperty({ type: [LeadResponseDto] })
  data!: LeadResponseDto[];

  @ApiProperty({ type: LeadsPaginationDto })
  pagination!: LeadsPaginationDto;
}
