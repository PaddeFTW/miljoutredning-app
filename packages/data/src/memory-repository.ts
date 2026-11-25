import type {
  CreateInvestigationInput,
  Investigation,
  InvestigationRepository,
  UpdateInvestigationInput
} from "@kg/core";

function nowIso(): string {
  return new Date().toISOString();
}

function createId(): string {
  return crypto.randomUUID();
}

/** In-memory adapter för tester och lokal webbutveckling utan databas. */
export function createMemoryRepository(
  seed: Investigation[] = []
): InvestigationRepository {
  const store = new Map<string, Investigation>(seed.map((item) => [item.id, structuredClone(item)]));

  return {
    async list() {
      return [...store.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async get(id) {
      const item = store.get(id);
      return item ? structuredClone(item) : null;
    },

    async create(input: CreateInvestigationInput) {
      const timestamp = nowIso();
      const investigation: Investigation = {
        id: createId(),
        title: input.title.trim(),
        status: "utkast",
        company: { ...input.company, name: input.company.name.trim() },
        sections: [],
        createdAt: timestamp,
        updatedAt: timestamp
      };
      store.set(investigation.id, investigation);
      return structuredClone(investigation);
    },

    async update(input: UpdateInvestigationInput) {
      const existing = store.get(input.id);
      if (!existing) {
        throw new Error("Investigation not found.");
      }
      const updated: Investigation = {
        ...existing,
        title: input.title.trim(),
        status: input.status ?? existing.status,
        company: { ...input.company, name: input.company.name.trim() },
        sections: input.sections ?? existing.sections,
        updatedAt: nowIso()
      };
      store.set(updated.id, updated);
      return structuredClone(updated);
    },

    async delete(id) {
      store.delete(id);
    },

    async search(query) {
      const q = query.trim().toLowerCase();
      const items = await this.list();
      if (!q) return items;
      return items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.company.name.toLowerCase().includes(q)
      );
    },

    async exportJson() {
      return {
        exportedAt: nowIso(),
        investigations: await this.list()
      };
    }
  };
}
