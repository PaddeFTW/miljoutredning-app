import { contextBridge, ipcRenderer } from "electron";

/** Preload validerar minimalt. Strikt validering sker i main-processen. */
const desktopApi = {
  investigations: {
    list: async () => ipcRenderer.invoke("investigations:list"),
    get: async (id: string) => ipcRenderer.invoke("investigations:get", id),
    create: async (input: unknown) => ipcRenderer.invoke("investigations:create", input),
    update: async (input: unknown) => ipcRenderer.invoke("investigations:update", input),
    delete: async (id: string) => ipcRenderer.invoke("investigations:delete", id)
  },
  database: {
    exportJson: async () => ipcRenderer.invoke("database:export-json"),
    backup: async () => ipcRenderer.invoke("database:backup"),
    restore: async () => ipcRenderer.invoke("database:restore")
  }
};

contextBridge.exposeInMainWorld("desktopApi", desktopApi);
