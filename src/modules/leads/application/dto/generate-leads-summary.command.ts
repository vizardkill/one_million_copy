import { LeadSource } from '../../domain/enums/lead-source.enum';

export interface GenerateLeadsSummaryCommand {
  source?: LeadSource;
  startDate?: Date;
  endDate?: Date;
}
