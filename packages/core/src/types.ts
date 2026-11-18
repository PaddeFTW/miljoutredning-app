export type InvestigationStatus = "utkast" | "pagaende" | "granskning" | "godkand";

export interface CompanyInfo {
  name: string;
  organizationNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  environmentalManager?: string;
}

export interface ScoredRegisterRow {
  id: string;
  label: string;
  quantity: number | null;
  impact: number | null;
  result: number | null;
  notes?: string;
  responsible?: string;
  saved?: boolean;
}

export interface SectionData {
  sectionId: number;
  completed: boolean;
  fields: Record<string, unknown>;
  rows: ScoredRegisterRow[];
}

export interface Investigation {
  id: string;
  title: string;
  status: InvestigationStatus | string;
  company: CompanyInfo;
  sections: SectionData[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvestigationInput {
  title: string;
  company: CompanyInfo;
}

export interface UpdateInvestigationInput {
  id: string;
  title: string;
  company: CompanyInfo;
  status?: string;
  sections?: SectionData[];
}
