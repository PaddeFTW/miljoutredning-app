import type { SectionData } from "@kg/core";

export interface ProductSectionDefinition {
  id: number;
  title: string;
  kind: "form" | "register" | "assessment" | "summary" | "optional";
  description: string;
}

/** Originalets 21 avsnitt från Miljöutredning.docx */
export const PRODUCT_SECTIONS: ProductSectionDefinition[] = [
  { id: 1, title: "Allmän information", kind: "form", description: "Företag, period, omfattning och signaturer." },
  { id: 2, title: "Verksamhetsbeskrivning", kind: "form", description: "Adress, kontakt, läge, anställda och verksamhet." },
  { id: 3, title: "Lagar och andra bindande krav", kind: "register", description: "Bindande krav, avvikelser och uppföljning." },
  { id: 4, title: "Miljöolyckor och miljöolycksrisker", kind: "register", description: "Händelser och risker med miljöpåverkan." },
  { id: 5, title: "Förbrukningsmaterial", kind: "register", description: "Material med mängd och miljöpåverkan." },
  { id: 6, title: "Råvaror och komponenter", kind: "register", description: "Råvaror och komponenter med bedömning." },
  { id: 7, title: "Kemikalier och kemiska produkter", kind: "register", description: "Kemikalier, SDB och bedömning." },
  { id: 8, title: "Avfall, farligt avfall och återvinning", kind: "register", description: "Avfallsfraktioner och hantering." },
  { id: 9, title: "Vatten och avlopp", kind: "register", description: "Vattenförbrukning och utsläpp." },
  { id: 10, title: "Buller", kind: "form", description: "Bullerkällor och åtgärder." },
  { id: 11, title: "Energianvändning", kind: "register", description: "El, värme och energislag." },
  { id: 12, title: "Transport", kind: "register", description: "Godstransporter och bränsle." },
  { id: 13, title: "Tjänsteresor", kind: "register", description: "Tjänsteresor och bedömning." },
  { id: 14, title: "Resor till och från jobbet", kind: "optional", description: "Frivillig kartläggning av pendling." },
  { id: 15, title: "Nödlägesberedskap", kind: "form", description: "Rutiner och ansvar vid nödläge." },
  { id: 16, title: "Leverantörsbedömning ur miljösynpunkt", kind: "register", description: "Leverantörer och miljökrav." },
  { id: 17, title: "Miljöpolicy", kind: "form", description: "Policytext eller hänvisning." },
  { id: 18, title: "Miljömål", kind: "register", description: "Mål, nyckeltal och uppföljning." },
  { id: 19, title: "Bedömning av miljöaspekter", kind: "assessment", description: "Samlad bedömning enligt mängd × påverkan." },
  { id: 20, title: "Betydande miljöaspekt", kind: "summary", description: "Aspekter med resultat 13–18." },
  { id: 21, title: "Positiva iakttagelser", kind: "optional", description: "Frivilliga positiva fynd." }
];

export function createEmptySections(): SectionData[] {
  return PRODUCT_SECTIONS.map((section) => ({
    sectionId: section.id,
    completed: false,
    fields: {},
    rows: []
  }));
}

export const PRODUCT_META = {
  productName: "Miljöutredning",
  brandName: "KvalitetsGruppen",
  displayName: "Miljöutredning – KvalitetsGruppen",
  templateName: "KvalitetsGruppen App Template"
} as const;
