import { LeadSource } from '../../domain/enums/lead-source.enum';

export interface UpdateLeadCommand {
  name?: string;
  email?: string;
  phone?: string | null;
  source?: LeadSource;
  productInterest?: string | null;
  budget?: number | null;
}
