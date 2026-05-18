import { Inject, Injectable } from '@nestjs/common';
import { LEAD_REPOSITORY } from '../../domain/repositories/lead.repository';
import type {
  LeadRepositoryPort,
  LeadStats,
} from '../../domain/repositories/lead.repository';

@Injectable()
export class GetLeadsStatsUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: LeadRepositoryPort,
  ) {}

  async execute(): Promise<LeadStats> {
    return this.leadRepository.getStats();
  }
}
