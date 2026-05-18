import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Lead } from '../../domain/entities/lead.entity';
import { LEAD_REPOSITORY } from '../../domain/repositories/lead.repository';
import type { LeadRepositoryPort } from '../../domain/repositories/lead.repository';

@Injectable()
export class GetLeadByIdUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: LeadRepositoryPort,
  ) {}

  async execute(id: string): Promise<Lead> {
    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new NotFoundException('Lead no encontrado.');
    }

    return lead;
  }
}
