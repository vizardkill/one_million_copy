import { Lead } from '../entities/lead.entity';
import { LeadFilters } from '../repositories/lead.repository';

export const LEAD_SUMMARY_SERVICE = Symbol('LEAD_SUMMARY_SERVICE');

export interface LeadSummaryServicePort {
  generateSummary(leads: Lead[], filters: LeadFilters): Promise<string>;
}
