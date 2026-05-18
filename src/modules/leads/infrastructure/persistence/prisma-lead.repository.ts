import { Injectable } from '@nestjs/common';
import {
  Lead as PrismaLead,
  LeadSource as PrismaLeadSource,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { Lead } from '../../domain/entities/lead.entity';
import { LeadSource } from '../../domain/enums/lead-source.enum';
import {
  CreateLeadRepositoryInput,
  LeadFilters,
  LeadRepositoryPort,
  LeadStats,
  ListLeadsRepositoryQuery,
  PaginatedLeads,
  UpdateLeadRepositoryInput,
} from '../../domain/repositories/lead.repository';

@Injectable()
export class PrismaLeadRepository implements LeadRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateLeadRepositoryInput): Promise<Lead> {
    const createdLead = await this.prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        source: this.toPrismaSource(data.source),
        productInterest: data.productInterest,
        budget: data.budget,
      },
    });

    return this.toDomain(createdLead);
  }

  async findById(id: string): Promise<Lead | null> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead || lead.deletedAt) {
      return null;
    }

    return this.toDomain(lead);
  }

  async findByEmail(email: string): Promise<Lead | null> {
    const lead = await this.prisma.lead.findUnique({
      where: { email },
    });

    return lead ? this.toDomain(lead) : null;
  }

  async findMany(query: ListLeadsRepositoryQuery): Promise<PaginatedLeads> {
    const where = this.buildWhere(query);
    const skip = (query.page - 1) * query.limit;

    const [total, leads] = await this.prisma.$transaction([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: query.limit,
      }),
    ]);

    return {
      items: leads.map((lead) => this.toDomain(lead)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    };
  }

  async findForSummary(filters: LeadFilters): Promise<Lead[]> {
    const where = this.buildWhere(filters);

    const leads = await this.prisma.lead.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 500,
    });

    return leads.map((lead) => this.toDomain(lead));
  }

  async update(
    id: string,
    data: UpdateLeadRepositoryInput,
  ): Promise<Lead | null> {
    const updateData: Prisma.LeadUpdateManyMutationInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.email !== undefined) {
      updateData.email = data.email;
    }

    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }

    if (data.source !== undefined) {
      updateData.source = this.toPrismaSource(data.source);
    }

    if (data.productInterest !== undefined) {
      updateData.productInterest = data.productInterest;
    }

    if (data.budget !== undefined) {
      updateData.budget = data.budget;
    }

    const updated = await this.prisma.lead.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: updateData,
    });

    if (updated.count === 0) {
      return null;
    }

    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.prisma.lead.updateMany({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count > 0;
  }

  async getStats(): Promise<LeadStats> {
    const activeLeadsFilter: Prisma.LeadWhereInput = {
      deletedAt: null,
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalLeads, budgetAverage, leadsLast7Days] =
      await this.prisma.$transaction([
        this.prisma.lead.count({ where: activeLeadsFilter }),
        this.prisma.lead.aggregate({
          where: activeLeadsFilter,
          _avg: {
            budget: true,
          },
        }),
        this.prisma.lead.count({
          where: {
            ...activeLeadsFilter,
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        }),
      ]);

    const leadsBySource = await Promise.all(
      Object.values(LeadSource).map(async (source) => ({
        source,
        total: await this.prisma.lead.count({
          where: {
            ...activeLeadsFilter,
            source: this.toPrismaSource(source),
          },
        }),
      })),
    );

    return {
      totalLeads,
      leadsBySource,
      averageBudgetUsd:
        budgetAverage._avg.budget === null
          ? null
          : Number(budgetAverage._avg.budget),
      leadsLast7Days,
    };
  }

  private buildWhere(filters: LeadFilters): Prisma.LeadWhereInput {
    const where: Prisma.LeadWhereInput = {
      deletedAt: null,
    };

    if (filters.source) {
      where.source = this.toPrismaSource(filters.source);
    }

    if (filters.startDate || filters.endDate) {
      const createdAt: Prisma.DateTimeFilter = {};

      if (filters.startDate) {
        createdAt.gte = filters.startDate;
      }

      if (filters.endDate) {
        createdAt.lte = filters.endDate;
      }

      where.createdAt = createdAt;
    }

    return where;
  }

  private toDomain(prismaLead: PrismaLead): Lead {
    return {
      id: prismaLead.id,
      name: prismaLead.name,
      email: prismaLead.email,
      phone: prismaLead.phone,
      source: prismaLead.source as LeadSource,
      productInterest: prismaLead.productInterest,
      budget: prismaLead.budget === null ? null : Number(prismaLead.budget),
      createdAt: prismaLead.createdAt,
      updatedAt: prismaLead.updatedAt,
      deletedAt: prismaLead.deletedAt,
    };
  }

  private toPrismaSource(source: LeadSource): PrismaLeadSource {
    return source;
  }
}
