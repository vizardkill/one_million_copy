import { Inject, Injectable } from '@nestjs/common';
import { LEAD_REPOSITORY } from '../../domain/repositories/lead.repository';
import type {
  LeadRepositoryPort,
  PaginatedLeads,
} from '../../domain/repositories/lead.repository';
import { ListLeadsQuery } from '../dto/list-leads.query';

@Injectable()
export class ListLeadsUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: LeadRepositoryPort,
  ) {}

  async execute(query: ListLeadsQuery): Promise<PaginatedLeads> {
    return this.leadRepository.findMany(query);
  }
}
