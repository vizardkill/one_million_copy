import { LeadSource } from '../../domain/enums/lead-source.enum';

export interface ListLeadsQuery {
  page: number;
  limit: number;
  source?: LeadSource;
  startDate?: Date;
  endDate?: Date;
}
