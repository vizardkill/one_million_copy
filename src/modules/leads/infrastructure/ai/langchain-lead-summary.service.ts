import { Injectable, Logger } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { LangchainService } from '../../../../shared/infrastructure/ai/langchain/langchain.service';
import { Lead } from '../../domain/entities/lead.entity';
import { LeadSource } from '../../domain/enums/lead-source.enum';
import { LeadFilters } from '../../domain/repositories/lead.repository';
import { LeadSummaryServicePort } from '../../domain/services/lead-summary.service';

const DEFAULT_RETRY_MS = 1500;
const MAX_RETRY_WAIT_MS = 3000;

const SUMMARY_PROMPT = `
Eres un analista comercial senior de One Million Copy SAS.

Con el siguiente set de leads, genera un resumen ejecutivo en espanol con esta estructura:
1) Analisis general del periodo.
2) Fuente principal y por que puede estar liderando.
3) Recomendaciones accionables (3 bullets maximo).

Reglas:
- Se concreto y orientado a negocio.
- No inventes datos, trabaja solo con los datos recibidos.
- Si faltan datos, mencionarlo explicitamente.

Filtro aplicado:
{filters}

Leads (JSON):
{leadsJson}
`;

@Injectable()
export class LangchainLeadSummaryService implements LeadSummaryServicePort {
  private readonly logger = new Logger(LangchainLeadSummaryService.name);

  constructor(private readonly langchainService: LangchainService) {}

  async generateSummary(leads: Lead[], filters: LeadFilters): Promise<string> {
    if (leads.length === 0) {
      return 'No se encontraron leads para el filtro solicitado.';
    }

    if (!this.langchainService.isConfigured()) {
      this.logger.warn(
        `LLM no configurado (provider=${this.langchainService.getProvider()} model=${this.langchainService.getModel()}). Se devolvera resumen mock.`,
      );
      return this.buildMockSummary(leads, filters);
    }

    const prompt = ChatPromptTemplate.fromTemplate(SUMMARY_PROMPT);
    const candidateModels = this.langchainService.getCandidateModels();
    const attemptsPerModel = this.langchainService.getAttemptsPerModel();

    for (const model of candidateModels) {
      const chain = prompt.pipe(
        this.langchainService.getChatModelForModel(model),
      );

      for (let attempt = 1; attempt <= attemptsPerModel; attempt += 1) {
        try {
          const response = await chain.invoke({
            filters: JSON.stringify(this.serializeFilters(filters), null, 2),
            leadsJson: JSON.stringify(
              this.serializeLeadsForPrompt(leads),
              null,
              2,
            ),
          });

          const summary = this.extractResponseText(response.content);
          if (summary) {
            this.logger.log(
              `Resumen IA generado con provider=${this.langchainService.getProvider()} model=${model} en intento ${attempt}/${attemptsPerModel}.`,
            );
            return summary;
          }

          this.logger.warn(
            `Respuesta IA vacia con model=${model} en intento ${attempt}/${attemptsPerModel}.`,
          );
        } catch (error: unknown) {
          const retryAfterMs = this.resolveRetryAfterMs(error);

          if (this.isRateLimitError(error) && attempt < attemptsPerModel) {
            this.logger.warn(
              `Rate limit con model=${model} (intento ${attempt}/${attemptsPerModel}). Reintentando en ${retryAfterMs}ms. Detalle: ${this.getErrorMessage(error)}.`,
            );
            await this.sleep(retryAfterMs);
            continue;
          }

          this.logger.error(
            `Error al generar resumen IA (provider=${this.langchainService.getProvider()} model=${model}): ${this.getErrorMessage(error)}.`,
          );
          break;
        }
      }

      this.logger.warn(
        `Se agotaron los intentos para model=${model}. Se probara el siguiente modelo si existe.`,
      );
    }

    this.logger.warn('Se activo fallback a resumen mock por fallo de IA.');
    return this.buildMockSummary(leads, filters);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private isRateLimitError(error: unknown): boolean {
    const status = this.extractStatusCode(error);
    if (status === 429) {
      return true;
    }

    return this.getErrorMessage(error).toLowerCase().includes('rate limit');
  }

  private resolveRetryAfterMs(error: unknown): number {
    const retryAfterSeconds = this.extractRetryAfterSeconds(error);
    if (retryAfterSeconds !== null && retryAfterSeconds > 0) {
      const requestedMs = Math.max(500, retryAfterSeconds * 1000);
      return Math.min(requestedMs, MAX_RETRY_WAIT_MS);
    }

    return DEFAULT_RETRY_MS;
  }

  private extractStatusCode(error: unknown): number | null {
    try {
      const record = this.toRecord(error);
      if (!record) {
        return null;
      }

      const status = this.asNumber(this.readRecordValue(record, 'status'));
      if (status !== null) {
        return status;
      }

      const nested = this.toRecord(this.readRecordValue(record, 'error'));
      if (!nested) {
        return null;
      }

      return this.asNumber(this.readRecordValue(nested, 'code'));
    } catch {
      return null;
    }
  }

  private extractRetryAfterSeconds(error: unknown): number | null {
    try {
      const root = this.toRecord(error);
      if (!root) {
        return null;
      }

      const direct = this.findRetryAfterSeconds(root);
      if (direct !== null) {
        return direct;
      }

      const nested = this.toRecord(this.readRecordValue(root, 'error'));
      if (!nested) {
        return null;
      }

      return this.findRetryAfterSeconds(nested);
    } catch {
      return null;
    }
  }

  private findRetryAfterSeconds(
    record: Record<string, unknown>,
  ): number | null {
    const direct = this.asNumber(
      this.readRecordValue(record, 'retry_after_seconds'),
    );
    if (direct !== null) {
      return direct;
    }

    const metadata = this.toRecord(this.readRecordValue(record, 'metadata'));
    if (!metadata) {
      return null;
    }

    const fromMetadata = this.asNumber(
      this.readRecordValue(metadata, 'retry_after_seconds'),
    );
    if (fromMetadata !== null) {
      return fromMetadata;
    }

    const headers = this.toRecord(this.readRecordValue(metadata, 'headers'));
    if (!headers) {
      return null;
    }

    const retryAfterHeader = this.readRecordValue(headers, 'Retry-After');
    if (typeof retryAfterHeader !== 'string') {
      return null;
    }

    const parsed = Number(retryAfterHeader);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private getErrorMessage(error: unknown): string {
    try {
      if (error instanceof Error) {
        try {
          if (typeof error.message === 'string' && error.message.length > 0) {
            return error.message;
          }
        } catch {
          // Ignore provider-specific getter errors.
        }

        return error.name || 'Error desconocido';
      }

      const record = this.toRecord(error);
      if (!record) {
        return 'Error desconocido';
      }

      const message = this.readRecordValue(record, 'message');
      if (typeof message === 'string' && message.length > 0) {
        return message;
      }

      const nested = this.toRecord(this.readRecordValue(record, 'error'));
      if (nested) {
        const nestedMessage = this.readRecordValue(nested, 'message');
        if (typeof nestedMessage === 'string' && nestedMessage.length > 0) {
          return nestedMessage;
        }
      }

      return 'Error desconocido';
    } catch {
      return 'No se pudo leer el detalle del error';
    }
  }

  private readRecordValue(
    record: Record<string, unknown>,
    key: string,
  ): unknown {
    try {
      return record[key];
    } catch {
      return undefined;
    }
  }

  private toRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== 'object' || value === null) {
      return null;
    }

    return value as Record<string, unknown>;
  }

  private asNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    return null;
  }

  private serializeFilters(filters: LeadFilters): {
    source?: LeadSource;
    startDate?: string;
    endDate?: string;
  } {
    return {
      source: filters.source,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString(),
    };
  }

  private serializeLeadsForPrompt(leads: Lead[]): Array<{
    id: string;
    source: LeadSource;
    budget: number | null;
    productInterest: string | null;
    createdAt: string;
  }> {
    return leads.map((lead) => ({
      id: lead.id,
      source: lead.source,
      budget: lead.budget,
      productInterest: lead.productInterest,
      createdAt: lead.createdAt.toISOString(),
    }));
  }

  private extractResponseText(content: unknown): string {
    if (typeof content === 'string') {
      return content.trim();
    }

    if (Array.isArray(content)) {
      const lines = content
        .map((item) => {
          if (typeof item === 'string') {
            return item;
          }

          if (
            typeof item === 'object' &&
            item !== null &&
            'text' in item &&
            typeof (item as { text?: unknown }).text === 'string'
          ) {
            return (item as { text: string }).text;
          }

          return '';
        })
        .filter((line) => line.length > 0);

      return lines.join('\n').trim();
    }

    return '';
  }

  private buildMockSummary(leads: Lead[], filters: LeadFilters): string {
    const sourceCount = new Map<LeadSource, number>(
      Object.values(LeadSource).map((source) => [source, 0]),
    );

    leads.forEach((lead) => {
      sourceCount.set(lead.source, (sourceCount.get(lead.source) ?? 0) + 1);
    });

    const topSource = [...sourceCount.entries()].sort((a, b) => b[1] - a[1])[0];

    const budgetValues = leads
      .filter((lead) => lead.budget !== null)
      .map((lead) => lead.budget as number);

    const averageBudget =
      budgetValues.length === 0
        ? null
        : budgetValues.reduce((sum, budget) => sum + budget, 0) /
          budgetValues.length;

    const filtersLabel = [
      filters.source ? `fuente=${filters.source}` : null,
      filters.startDate ? `desde=${filters.startDate.toISOString()}` : null,
      filters.endDate ? `hasta=${filters.endDate.toISOString()}` : null,
    ]
      .filter((item) => item !== null)
      .join(', ');

    return [
      'Resumen ejecutivo (mock):',
      `- Leads analizados: ${leads.length}.`,
      `- Fuente principal: ${topSource?.[0] ?? 'sin datos'} (${topSource?.[1] ?? 0} leads).`,
      `- Presupuesto promedio: ${
        averageBudget === null
          ? 'sin datos'
          : `$${averageBudget.toFixed(2)} USD`
      }.`,
      `- Filtros aplicados: ${filtersLabel || 'sin filtros'}.`,
      '- Recomendaciones: priorizar el canal lider, crear una oferta especifica para el interes dominante y automatizar seguimiento de leads con presupuesto alto.',
    ].join('\n');
  }
}
