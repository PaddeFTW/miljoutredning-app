import type {
  CreateInvestigationInput,
  Investigation,
  InvestigationRepository,
  UpdateInvestigationInput
} from "@kg/core";

/**
 * Stub för Supabase-adapter.
 * BLOCKERAD tills aktiv test-/produktionsdatabas med RLS och utredningstabeller finns.
 */
export function createSupabaseRepository(_client: unknown): InvestigationRepository {
  const blocked = async () => {
    throw new Error(
      "Supabase-adaptern är förberedd men blockerad: ingen aktiv testdatabas är konfigurerad."
    );
  };

  return {
    list: blocked as () => Promise<Investigation[]>,
    get: blocked as (id: string) => Promise<Investigation | null>,
    create: blocked as (input: CreateInvestigationInput) => Promise<Investigation>,
    update: blocked as (input: UpdateInvestigationInput) => Promise<Investigation>,
    delete: blocked as (id: string) => Promise<void>,
    search: blocked as (query: string) => Promise<Investigation[]>,
    exportJson: blocked
  };
}
