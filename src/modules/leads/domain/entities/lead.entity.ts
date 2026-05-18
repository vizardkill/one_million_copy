import { LeadSource } from '../enums/lead-source.enum';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  source: LeadSource;
  productInterest: string | null;
  budget: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
