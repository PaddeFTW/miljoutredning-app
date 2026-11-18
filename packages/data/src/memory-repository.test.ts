import assert from "node:assert/strict";
import { test } from "node:test";
import { createMemoryRepository } from "./memory-repository.ts";

test("memory repository supports create, update, search and delete", async () => {
  const repo = createMemoryRepository();
  const created = await repo.create({
    title: "Miljöutredning 2026",
    company: { name: "Testbolaget AB" }
  });

  assert.equal(created.title, "Miljöutredning 2026");
  assert.equal((await repo.list()).length, 1);

  const updated = await repo.update({
    id: created.id,
    title: "Miljöutredning 2026 – uppdaterad",
    company: { name: "Testbolaget AB" },
    status: "pagaende"
  });
  assert.equal(updated.status, "pagaende");

  const found = await repo.search?.("testbolaget");
  assert.equal(found?.length, 1);

  await repo.delete(created.id);
  assert.equal((await repo.list()).length, 0);
});
