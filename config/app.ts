/**
 * config/app.ts
 *
 * Central configuration file for all product- and brand-specific values.
 * Override these defaults when building a real product on top of this template.
 *
 * All UI labels, metadata titles, and navigation texts that reference the
 * product or brand name are derived from this file — never hardcoded in
 * components.
 */

export const appConfig = {
  /** The full product name shown in titles and headings. */
  productName: "Miljöutredning",

  /** Short brand name shown in compact contexts (sidebar header, auth header). */
  brandName: "KvalitetsGruppen",

  /** Default metadata description used in <head> and social cards. */
  description:
    "Digital miljöutredning från KvalitetsGruppen – kartlägg miljöaspekter, bedöm påverkan och exportera underlag.",

  /**
   * Enable social / OAuth login providers.
   * Set to true only after configuring providers in Supabase Dashboard.
   */
  socialLogin: false,

  /**
   * Enable the Smart Workspace feature.
   * Reserved for future use — keep false until implemented.
   */
  smartWorkspace: false,
} as const;

export type AppConfig = typeof appConfig;
