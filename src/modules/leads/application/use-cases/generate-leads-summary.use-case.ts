import { Inject, Injectable } from '@nestjs/common';
import { LEAD_REPOSITORY } from '../../domain/repositories/lead.repository';
import type {
  LeadFilters,
  LeadRepositoryPort,
} from '../../domain/repositories/lead.repository';
import { LEAD_SUMMARY_SERVICE } from '../../domain/services/lead-summary.service';
import type { LeadSummaryServicePort } from '../../domain/services/lead-summary.service';
import { GenerateLeadsSummaryCommand } from '../dto/generate-leads-summary.command';

@Injectable()
export class GenerateLeadsSummaryUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: LeadRepositoryPort,
    @Inject(LEAD_SUMMARY_SERVICE)
    private readonly leadSummaryService: LeadSummaryServicePort,
  ) {}

  async execute(command: GenerateLeadsSummaryCommand): Promise<string> {
    const filters: LeadFilters = {
      source: command.source,
      startDate: command.startDate,
      endDate: command.endDate,
    };

    const leads = await this.leadRepository.findForSummary(filters);
    return this.leadSummaryService.generateSummary(leads, filters);
  }
}
