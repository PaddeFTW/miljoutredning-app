import { BrowserWindow, app, dialog, ipcMain } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { DesktopDatabase } from "./db";

const investigationIdSchema = z.string().uuid();
const companySchema = z.object({
  name: z.string().trim().min(1, "Företagsnamn krävs.")
});
const createInvestigationSchema = z.object({
  title: z.string().trim().min(1, "Titel krävs."),
  company: companySchema
});
const updateInvestigationSchema = createInvestigationSchema.extend({
  id: investigationIdSchema,
  status: z.string().trim().min(1).optional(),
  sections: z.array(z.unknown()).optional()
});

let database: DesktopDatabase;

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 620,
    title: "Miljöutredning – KvalitetsGruppen",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      // Sandbox blockerar require('zod') i preload; behåll contextIsolation.
      sandbox: false
    }
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

async function writeSmokeLog(message: string): Promise<void> {
  try {
    const logPath = path.join(app.getPath("userData"), "smoke-test.log");
    await fs.appendFile(logPath, `${new Date().toISOString()} ${message}\n`, "utf8");
  } catch {
    // Ignorera loggfel under smoke-test.
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle("investigations:list", async () => {
    try {
      const items = database.listInvestigations();
      await writeSmokeLog(`list ok count=${items.length}`);
      return items;
    } catch (error) {
      await writeSmokeLog(`list error ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  });

  ipcMain.handle("investigations:get", (_event, id: unknown) => {
    return database.getInvestigation(investigationIdSchema.parse(id));
  });

  ipcMain.handle("investigations:create", (_event, input: unknown) => {
    return database.createInvestigation(createInvestigationSchema.parse(input));
  });

  ipcMain.handle("investigations:update", (_event, input: unknown) => {
    return database.updateInvestigation(updateInvestigationSchema.parse(input));
  });

  ipcMain.handle("investigations:delete", (_event, id: unknown) => {
    return database.deleteInvestigation(investigationIdSchema.parse(id));
  });

  ipcMain.handle("database:export-json", async () => {
    const result = await dialog.showSaveDialog({
      title: "Exportera JSON",
      defaultPath: `miljoutredningar-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [{ name: "JSON", extensions: ["json"] }]
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true as const };
    }

    await fs.writeFile(result.filePath, JSON.stringify(database.exportJson(), null, 2), "utf8");
    return { canceled: false as const, filePath: result.filePath };
  });

  ipcMain.handle("database:backup", async () => {
    const result = await dialog.showSaveDialog({
      title: "Säkerhetskopiera databas",
      defaultPath: `miljoutredning-backup-${new Date().toISOString().slice(0, 10)}.sqlite`,
      filters: [{ name: "SQLite databas", extensions: ["sqlite", "db"] }]
    });

    if (result.canceled || !result.filePath) {
      return { canceled: true as const };
    }

    await database.backupTo(result.filePath);
    return { canceled: false as const, filePath: result.filePath };
  });

  ipcMain.handle("database:restore", async () => {
    const result = await dialog.showOpenDialog({
      title: "Återställ databas",
      properties: ["openFile"],
      filters: [{ name: "SQLite databas", extensions: ["sqlite", "db"] }]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true as const };
    }

    await database.restoreFrom(result.filePaths[0]);
    return { canceled: false as const };
  });
}

app.whenReady().then(async () => {
  database = new DesktopDatabase();
  await database.initialize();
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
