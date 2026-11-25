import type {
  CreateInvestigationInput,
  Investigation,
  UpdateInvestigationInput
} from "./types";

/** Plattformsoberoende datalager. Produktkod ska bara använda detta gränssnitt. */
export interface InvestigationRepository {
  list(): Promise<Investigation[]>;
  get(id: string): Promise<Investigation | null>;
  create(input: CreateInvestigationInput): Promise<Investigation>;
  update(input: UpdateInvestigationInput): Promise<Investigation>;
  delete(id: string): Promise<void>;
  search?(query: string): Promise<Investigation[]>;
  exportJson?(): Promise<unknown>;
  backup?(destinationPath: string): Promise<void>;
  restore?(sourcePath: string): Promise<void>;
}
