import { FormEvent, useEffect, useMemo, useState } from "react";

type Investigation = {
  id: string;
  title: string;
  status: string;
  company: { name: string };
  sections: unknown[];
  createdAt: string;
  updatedAt: string;
};

type FileActionResult = { canceled: true } | { canceled: false; filePath?: string };

type DesktopApi = {
  investigations: {
    list: () => Promise<Investigation[]>;
    get: (id: string) => Promise<Investigation | null>;
    create: (input: { title: string; company: { name: string } }) => Promise<Investigation>;
    update: (input: {
      id: string;
      title: string;
      company: { name: string };
      status?: string;
      sections?: unknown[];
    }) => Promise<Investigation>;
    delete: (id: string) => Promise<void>;
  };
  database: {
    exportJson: () => Promise<FileActionResult>;
    backup: () => Promise<FileActionResult>;
    restore: () => Promise<FileActionResult>;
  };
};

declare global {
  interface Window {
    desktopApi: DesktopApi;
  }
}

const emptyDraft = {
  title: "",
  companyName: ""
};

export default function App() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selected, setSelected] = useState<Investigation | null>(null);
  const [createDraft, setCreateDraft] = useState(emptyDraft);
  const [draft, setDraft] = useState(emptyDraft);
  const [message, setMessage] = useState("Redo.");
  const [isBusy, setIsBusy] = useState(false);

  const selectedUpdatedAt = useMemo(() => {
    if (!selected) {
      return "";
    }

    return new Intl.DateTimeFormat("sv-SE", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(selected.updatedAt));
  }, [selected]);

  useEffect(() => {
    void reloadInvestigations();
  }, []);

  async function reloadInvestigations(nextSelectedId?: string) {
    const items = await window.desktopApi.investigations.list();
    setInvestigations(items);

    const nextSelected = nextSelectedId
      ? items.find((item) => item.id === nextSelectedId) ?? null
      : items[0] ?? null;

    setSelected(nextSelected);
    setDraft(nextSelected ? { title: nextSelected.title, companyName: nextSelected.company.name } : emptyDraft);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createDraft.title.trim() || !createDraft.companyName.trim()) {
      setMessage("Fyll i titel och företag.");
      return;
    }

    await runAction("Skapar utredning...", async () => {
      const created = await window.desktopApi.investigations.create({
        title: createDraft.title,
        company: { name: createDraft.companyName }
      });
      setCreateDraft(emptyDraft);
      await reloadInvestigations(created.id);
      setMessage("Utredningen skapades.");
    });
  }

  async function handleSelect(id: string) {
    const item = await window.desktopApi.investigations.get(id);
    setSelected(item);
    setDraft(item ? { title: item.title, companyName: item.company.name } : emptyDraft);
    setMessage(item ? "Utredningen öppnades." : "Utredningen kunde inte hittas.");
  }

  async function handleSave() {
    if (!selected) {
      return;
    }

    await runAction("Sparar...", async () => {
      const updated = await window.desktopApi.investigations.update({
        id: selected.id,
        title: draft.title,
        company: { name: draft.companyName }
      });
      await reloadInvestigations(updated.id);
      setMessage("Ändringarna sparades.");
    });
  }

  async function handleDelete() {
    if (!selected) {
      return;
    }

    const shouldDelete = window.confirm(`Ta bort "${selected.title}"? Detta kan inte ångras.`);
    if (!shouldDelete) {
      return;
    }

    await runAction("Tar bort...", async () => {
      await window.desktopApi.investigations.delete(selected.id);
      await reloadInvestigations();
      setMessage("Utredningen togs bort.");
    });
  }

  async function handleExportJson() {
    await runFileAction("Exporterar JSON...", window.desktopApi.database.exportJson, "JSON exporterades.");
  }

  async function handleBackup() {
    await runFileAction("Säkerhetskopierar...", window.desktopApi.database.backup, "Databasen säkerhetskopierades.");
  }

  async function handleRestore() {
    const shouldRestore = window.confirm("Återställ databasen från en fil? Nuvarande databas ersätts.");
    if (!shouldRestore) {
      return;
    }

    await runAction("Återställer...", async () => {
      const result = await window.desktopApi.database.restore();
      if (result.canceled) {
        setMessage("Återställning avbröts.");
        return;
      }

      await reloadInvestigations();
      setMessage("Databasen återställdes.");
    });
  }

  async function runFileAction(
    busyMessage: string,
    action: () => Promise<FileActionResult>,
    successMessage: string
  ) {
    await runAction(busyMessage, async () => {
      const result = await action();
      setMessage(result.canceled ? "Åtgärden avbröts." : successMessage);
    });
  }

  async function runAction(busyMessage: string, action: () => Promise<void>) {
    setIsBusy(true);
    setMessage(busyMessage);

    try {
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Något gick fel.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="sidebar" aria-label="Utredningar">
        <div>
          <p className="eyebrow">Miljöutredning</p>
          <h1>KvalitetsGruppen</h1>
          <p className="description">Lokal desktopapp med offline-databas.</p>
        </div>

        <form className="card create-form" onSubmit={handleCreate}>
          <h2>Ny utredning</h2>
          <label>
            Titel
            <input
              value={createDraft.title}
              onChange={(event) => setCreateDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Ex. Miljöutredning 2026"
            />
          </label>
          <label>
            Företag
            <input
              value={createDraft.companyName}
              onChange={(event) => setCreateDraft((current) => ({ ...current, companyName: event.target.value }))}
              placeholder="Företagsnamn"
            />
          </label>
          <button type="submit" disabled={isBusy}>
            Skapa ny
          </button>
        </form>

        <div className="toolbar">
          <button type="button" onClick={handleExportJson} disabled={isBusy}>
            Exportera JSON
          </button>
          <button type="button" onClick={handleBackup} disabled={isBusy}>
            Säkerhetskopiera
          </button>
          <button type="button" onClick={handleRestore} disabled={isBusy}>
            Återställ
          </button>
        </div>
      </section>

      <section className="content">
        <div className="status-bar" role="status">
          {message}
        </div>

        <div className="workspace">
          <aside className="investigation-list" aria-label="Lista över utredningar">
            <h2>Utredningar</h2>
            {investigations.length === 0 ? (
              <p className="empty-state">Inga utredningar ännu. Skapa den första till vänster.</p>
            ) : (
              <ul>
                {investigations.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={selected?.id === item.id ? "selected" : ""}
                      onClick={() => void handleSelect(item.id)}
                    >
                      <strong>{item.title}</strong>
                      <span>{item.company.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section className="editor card" aria-label="Redigera utredning">
            {selected ? (
              <>
                <div className="editor-header">
                  <div>
                    <p className="eyebrow">Utkast</p>
                    <h2>{selected.title}</h2>
                    <p>Senast ändrad {selectedUpdatedAt}</p>
                  </div>
                  <button type="button" className="danger" onClick={handleDelete} disabled={isBusy}>
                    Ta bort
                  </button>
                </div>

                <label>
                  Titel
                  <input
                    value={draft.title}
                    onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  />
                </label>
                <label>
                  Företag
                  <input
                    value={draft.companyName}
                    onChange={(event) => setDraft((current) => ({ ...current, companyName: event.target.value }))}
                  />
                </label>
                <button type="button" onClick={handleSave} disabled={isBusy}>
                  Spara ändringar
                </button>

                <div className="sections-panel">
                  <h3>21 avsnitt</h3>
                  <p>
                    Utredningen innehåller {Array.isArray(selected.sections) ? selected.sections.length : 0} avsnittsplatser
                    enligt originaldokumentet. Detaljerade formulär fylls i successivt.
                  </p>
                  <ol>
                    {(Array.isArray(selected.sections) ? selected.sections : []).slice(0, 21).map((section, index) => {
                      const sectionId =
                        typeof section === "object" && section !== null && "sectionId" in section
                          ? Number((section as { sectionId: number }).sectionId)
                          : index + 1;
                      const completed =
                        typeof section === "object" && section !== null && "completed" in section
                          ? Boolean((section as { completed: boolean }).completed)
                          : false;
                      return (
                        <li key={sectionId}>
                          Avsnitt {sectionId}: {completed ? "Ifyllt" : "Ej ifyllt"}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <h2>Välj eller skapa en utredning</h2>
                <p>All data sparas lokalt på datorn i AppData.</p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
