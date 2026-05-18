import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Lead } from '../../domain/entities/lead.entity';
import { LEAD_REPOSITORY } from '../../domain/repositories/lead.repository';
import type { LeadRepositoryPort } from '../../domain/repositories/lead.repository';
import { UpdateLeadCommand } from '../dto/update-lead.command';

@Injectable()
export class UpdateLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: LeadRepositoryPort,
  ) {}

  async execute(id: string, command: UpdateLeadCommand): Promise<Lead> {
    const currentLead = await this.leadRepository.findById(id);
    if (!currentLead) {
      throw new NotFoundException('Lead no encontrado.');
    }

    if (command.email && command.email !== currentLead.email) {
      const existingLead = await this.leadRepository.findByEmail(command.email);
      if (existingLead && existingLead.id !== id) {
        throw new ConflictException('Ya existe un lead con este email.');
      }
    }

    const updatedLead = await this.leadRepository.update(id, command);
    if (!updatedLead) {
      throw new NotFoundException('Lead no encontrado.');
    }

    return updatedLead;
  }
}
