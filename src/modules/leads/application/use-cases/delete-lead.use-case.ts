import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LEAD_REPOSITORY } from '../../domain/repositories/lead.repository';
import type { LeadRepositoryPort } from '../../domain/repositories/lead.repository';

@Injectable()
export class DeleteLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: LeadRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.leadRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException('Lead no encontrado.');
    }
  }
}
