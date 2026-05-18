import type { Lead } from '../../../domain/entities/lead.entity';
import { LeadSource } from '../../../domain/enums/lead-source.enum';
import type {
  LeadFilters,
  LeadRepositoryPort,
  LeadStats,
  ListLeadsRepositoryQuery,
  PaginatedLeads,
} from '../../../domain/repositories/lead.repository';
import type { LeadSummaryServicePort } from '../../../domain/services/lead-summary.service';

export const mockLead: Lead = {
  id: 'e95e6ae9-7f77-4696-a602-9fbf50f0e550',
  name: 'Laura Mendoza',
  email: 'laura@example.com',
  phone: '+573001112233',
  source: LeadSource.INSTAGRAM,
  productInterest: 'Curso de copywriting',
  budget: 450,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  deletedAt: null,
};

export const secondMockLead: Lead = {
  id: '7e34e7e2-b5d9-4f72-a6d0-8bd84087fa93',
  name: 'Camila Rojas',
  email: 'camila@example.com',
  phone: '+573009998877',
  source: LeadSource.FACEBOOK,
  productInterest: 'Mentoria embudos',
  budget: 980,
  createdAt: new Date('2026-02-01T00:00:00.000Z'),
  updatedAt: new Date('2026-02-01T00:00:00.000Z'),
  deletedAt: null,
};

export function createRepositoryMock(): jest.Mocked<LeadRepositoryPort> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findMany: jest.fn<Promise<PaginatedLeads>, [ListLeadsRepositoryQuery]>(),
    findForSummary: jest.fn<Promise<Lead[]>, [LeadFilters]>(),
    update: jest.fn(),
    softDelete: jest.fn<Promise<boolean>, [string]>(),
    getStats: jest.fn<Promise<LeadStats>, []>(),
  };
}

export function createSummaryServiceMock(): jest.Mocked<LeadSummaryServicePort> {
  return {
    generateSummary: jest.fn<Promise<string>, [Lead[], LeadFilters]>(),
  };
}
