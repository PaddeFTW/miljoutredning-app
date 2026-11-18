import { contextBridge, ipcRenderer } from "electron";
import { z } from "zod";

const companySchema = z.object({
  name: z.string().trim().min(1)
});
const investigationSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  status: z.string(),
  company: companySchema,
  sections: z.array(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string()
});
const createInvestigationSchema = z.object({
  title: z.string().trim().min(1),
  company: companySchema
});
const updateInvestigationSchema = createInvestigationSchema.extend({
  id: z.string().uuid(),
  status: z.string().trim().min(1).optional(),
  sections: z.array(z.unknown()).optional()
});
const fileActionResultSchema = z.discriminatedUnion("canceled", [
  z.object({ canceled: z.literal(true) }),
  z.object({ canceled: z.literal(false), filePath: z.string().optional() })
]);

const desktopApi = {
  investigations: {
    list: async () => z.array(investigationSchema).parse(await ipcRenderer.invoke("investigations:list")),
    get: async (id: string) => {
      const result = await ipcRenderer.invoke("investigations:get", z.string().uuid().parse(id));
      return result === null ? null : investigationSchema.parse(result);
    },
    create: async (input: unknown) => {
      const result = await ipcRenderer.invoke("investigations:create", createInvestigationSchema.parse(input));
      return investigationSchema.parse(result);
    },
    update: async (input: unknown) => {
      const result = await ipcRenderer.invoke("investigations:update", updateInvestigationSchema.parse(input));
      return investigationSchema.parse(result);
    },
    delete: async (id: string) => {
      await ipcRenderer.invoke("investigations:delete", z.string().uuid().parse(id));
    }
  },
  database: {
    exportJson: async () => fileActionResultSchema.parse(await ipcRenderer.invoke("database:export-json")),
    backup: async () => fileActionResultSchema.parse(await ipcRenderer.invoke("database:backup")),
    restore: async () => fileActionResultSchema.parse(await ipcRenderer.invoke("database:restore"))
  }
};

contextBridge.exposeInMainWorld("desktopApi", desktopApi);
