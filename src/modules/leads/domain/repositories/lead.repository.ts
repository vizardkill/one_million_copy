import { Lead } from '../entities/lead.entity';
import { LeadSource } from '../enums/lead-source.enum';

export const LEAD_REPOSITORY = Symbol('LEAD_REPOSITORY');

export interface LeadFilters {
  source?: LeadSource;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateLeadRepositoryInput {
  name: string;
  email: string;
  phone: string | null;
  source: LeadSource;
  productInterest: string | null;
  budget: number | null;
}

export interface UpdateLeadRepositoryInput {
  name?: string;
  email?: string;
  phone?: string | null;
  source?: LeadSource;
  productInterest?: string | null;
  budget?: number | null;
}

export interface ListLeadsRepositoryQuery extends LeadFilters {
  page: number;
  limit: number;
}

export interface PaginatedLeads {
  items: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadsBySource {
  source: LeadSource;
  total: number;
}

export interface LeadStats {
  totalLeads: number;
  leadsBySource: LeadsBySource[];
  averageBudgetUsd: number | null;
  leadsLast7Days: number;
}

export interface LeadRepositoryPort {
  create(data: CreateLeadRepositoryInput): Promise<Lead>;
  findById(id: string): Promise<Lead | null>;
  findByEmail(email: string): Promise<Lead | null>;
  findMany(query: ListLeadsRepositoryQuery): Promise<PaginatedLeads>;
  findForSummary(filters: LeadFilters): Promise<Lead[]>;
  update(id: string, data: UpdateLeadRepositoryInput): Promise<Lead | null>;
  softDelete(id: string): Promise<boolean>;
  getStats(): Promise<LeadStats>;
}
