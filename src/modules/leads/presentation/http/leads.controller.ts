import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../../../../shared/infrastructure/auth/api-key.guard';
import { CreateLeadUseCase } from '../../application/use-cases/create-lead.use-case';
import { DeleteLeadUseCase } from '../../application/use-cases/delete-lead.use-case';
import { GenerateLeadsSummaryUseCase } from '../../application/use-cases/generate-leads-summary.use-case';
import { GetLeadByIdUseCase } from '../../application/use-cases/get-lead-by-id.use-case';
import { GetLeadsStatsUseCase } from '../../application/use-cases/get-leads-stats.use-case';
import { ListLeadsUseCase } from '../../application/use-cases/list-leads.use-case';
import { UpdateLeadUseCase } from '../../application/use-cases/update-lead.use-case';
import { Lead } from '../../domain/entities/lead.entity';
import { CreateLeadRequestDto } from './dto/create-lead.request.dto';
import { LeadResponseDto } from './dto/lead.response.dto';
import { LeadsStatsResponseDto } from './dto/leads-stats.response.dto';
import { LeadsSummaryRequestDto } from './dto/leads-summary.request.dto';
import { LeadsSummaryResponseDto } from './dto/leads-summary.response.dto';
import { ListLeadsQueryDto } from './dto/list-leads.query.dto';
import { ListLeadsResponseDto } from './dto/list-leads.response.dto';
import { TypeformWebhookRequestDto } from './dto/typeform-webhook.request.dto';
import { UpdateLeadRequestDto } from './dto/update-lead.request.dto';

@ApiTags('Leads')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly createLeadUseCase: CreateLeadUseCase,
    private readonly listLeadsUseCase: ListLeadsUseCase,
    private readonly getLeadByIdUseCase: GetLeadByIdUseCase,
    private readonly updateLeadUseCase: UpdateLeadUseCase,
    private readonly deleteLeadUseCase: DeleteLeadUseCase,
    private readonly getLeadsStatsUseCase: GetLeadsStatsUseCase,
    private readonly generateLeadsSummaryUseCase: GenerateLeadsSummaryUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo lead' })
  @ApiCreatedResponse({ type: LeadResponseDto })
  async create(@Body() body: CreateLeadRequestDto): Promise<LeadResponseDto> {
    const createdLead = await this.createLeadUseCase.execute({
      name: body.nombre,
      email: body.email.toLowerCase(),
      phone: body.telefono ?? null,
      source: body.fuente,
      productInterest: body.producto_interes ?? null,
      budget: body.presupuesto ?? null,
    });

    return this.toResponse(createdLead);
  }

  @Get()
  @ApiOperation({ summary: 'Listar leads con paginacion y filtros' })
  @ApiOkResponse({ type: ListLeadsResponseDto })
  async findAll(
    @Query() query: ListLeadsQueryDto,
  ): Promise<ListLeadsResponseDto> {
    const result = await this.listLeadsUseCase.execute({
      page: query.page,
      limit: query.limit,
      source: query.fuente,
      startDate: query.fecha_inicio ? new Date(query.fecha_inicio) : undefined,
      endDate: query.fecha_fin ? new Date(query.fecha_fin) : undefined,
    });

    return {
      data: result.items.map((lead) => this.toResponse(lead)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: result.totalPages,
      },
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadisticas de leads' })
  @ApiOkResponse({ type: LeadsStatsResponseDto })
  async getStats(): Promise<LeadsStatsResponseDto> {
    const stats = await this.getLeadsStatsUseCase.execute();

    return {
      total_leads: stats.totalLeads,
      leads_por_fuente: stats.leadsBySource.map((item) => ({
        fuente: item.source,
        total: item.total,
      })),
      promedio_presupuesto_usd: stats.averageBudgetUsd,
      leads_ultimos_7_dias: stats.leadsLast7Days,
    };
  }

  @Post('ai/summary')
  @ApiOperation({ summary: 'Generar resumen ejecutivo con IA' })
  @ApiOkResponse({ type: LeadsSummaryResponseDto })
  async summary(
    @Body() body: LeadsSummaryRequestDto,
  ): Promise<LeadsSummaryResponseDto> {
    const summary = await this.generateLeadsSummaryUseCase.execute({
      source: body.fuente,
      startDate: body.fecha_inicio ? new Date(body.fecha_inicio) : undefined,
      endDate: body.fecha_fin ? new Date(body.fecha_fin) : undefined,
    });

    return { summary };
  }

  @Post('webhook')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Webhook de leads simulando Typeform' })
  @ApiCreatedResponse({ type: LeadResponseDto })
  async webhook(
    @Body() body: TypeformWebhookRequestDto,
  ): Promise<LeadResponseDto> {
    const createdLead = await this.createLeadUseCase.execute({
      name: body.lead.nombre,
      email: body.lead.email.toLowerCase(),
      phone: body.lead.telefono ?? null,
      source: body.lead.fuente,
      productInterest: body.lead.producto_interes ?? null,
      budget: body.lead.presupuesto ?? null,
    });

    return this.toResponse(createdLead);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un lead por id' })
  @ApiOkResponse({ type: LeadResponseDto })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<LeadResponseDto> {
    const lead = await this.getLeadByIdUseCase.execute(id);
    return this.toResponse(lead);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un lead existente' })
  @ApiOkResponse({ type: LeadResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateLeadRequestDto,
  ): Promise<LeadResponseDto> {
    const updatedLead = await this.updateLeadUseCase.execute(id, {
      name: body.nombre,
      email: body.email?.toLowerCase(),
      phone: body.telefono,
      source: body.fuente,
      productInterest: body.producto_interes,
      budget: body.presupuesto,
    });

    return this.toResponse(updatedLead);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un lead (soft delete)' })
  @ApiNoContentResponse()
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.deleteLeadUseCase.execute(id);
  }

  private toResponse(lead: Lead): LeadResponseDto {
    return {
      id: lead.id,
      nombre: lead.name,
      email: lead.email,
      telefono: lead.phone,
      fuente: lead.source,
      producto_interes: lead.productInterest,
      presupuesto: lead.budget,
      created_at: lead.createdAt.toISOString(),
      updated_at: lead.updatedAt.toISOString(),
      deleted_at: lead.deletedAt ? lead.deletedAt.toISOString() : null,
    };
  }
}
