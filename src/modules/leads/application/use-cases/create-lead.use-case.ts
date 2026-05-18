import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Lead } from '../../domain/entities/lead.entity';
import { LEAD_REPOSITORY } from '../../domain/repositories/lead.repository';
import type { LeadRepositoryPort } from '../../domain/repositories/lead.repository';
import { CreateLeadCommand } from '../dto/create-lead.command';

@Injectable()
export class CreateLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: LeadRepositoryPort,
  ) {}

  async execute(command: CreateLeadCommand): Promise<Lead> {
    const existingLead = await this.leadRepository.findByEmail(command.email);
    if (existingLead) {
      throw new ConflictException('Ya existe un lead con este email.');
    }

    return this.leadRepository.create(command);
  }
}
