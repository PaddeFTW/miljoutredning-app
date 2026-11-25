import Link from "next/link";
import { BarChart3, BookOpen, FileCheck2, Leaf, Settings2 } from "lucide-react";

const links = [{ href: "/dashboard", label: "Översikt", icon: BarChart3 }, { href: "/guidance", label: "Vägledning", icon: BookOpen }, { href: "/settings", label: "Inställningar", icon: Settings2 }];
export function AppShell({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) {
  return <div className="min-h-screen bg-background"><aside className="fixed inset-y-0 hidden w-64 border-r bg-card lg:block"><div className="flex h-full flex-col gap-8 p-5"><Link href="/" className="flex items-center gap-3 font-semibold"><span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Leaf className="size-5" /></span>Miljöutredning</Link><nav aria-label="Appnavigation" className="flex flex-col gap-1">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><Icon className="size-4" />{label}</Link>)}</nav><div className="mt-auto rounded-xl bg-primary/10 p-4"><FileCheck2 className="size-5 text-primary" /><p className="mt-3 text-sm font-medium">KvalitetsGruppen</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Permanent lagring aktiveras via Windows-app eller Supabase.</p></div></div></aside><div className="lg:pl-64"><header className="border-b bg-card/80"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8"><Link href="/" className="flex items-center gap-2 font-semibold lg:hidden"><Leaf className="size-5 text-primary" />Miljöutredning</Link><div className="hidden lg:block" /><div className="flex items-center gap-3 text-sm text-muted-foreground"><span className="hidden sm:inline">Miljöutredning – KvalitetsGruppen</span></div></div></header><main className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12"><div className="mb-8 flex flex-col gap-2"><p className="text-sm font-medium text-primary">Miljöutredning</p><h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">{title}</h1>{description && <p className="max-w-2xl leading-7 text-muted-foreground">{description}</p>}</div>{children}</main></div></div>;
}

/** Originalets 21 avsnitt från Miljöutredning.docx */
export const sections = [
  "Allmän information",
  "Verksamhetsbeskrivning",
  "Lagar och andra bindande krav",
  "Miljöolyckor och miljöolycksrisker",
  "Förbrukningsmaterial",
  "Råvaror och komponenter",
  "Kemikalier och kemiska produkter",
  "Avfall, farligt avfall och återvinning",
  "Vatten och avlopp",
  "Buller",
  "Energianvändning",
  "Transport",
  "Tjänsteresor",
  "Resor till och från jobbet",
  "Nödlägesberedskap",
  "Leverantörsbedömning ur miljösynpunkt",
  "Miljöpolicy",
  "Miljömål",
  "Bedömning av miljöaspekter",
  "Betydande miljöaspekt",
  "Positiva iakttagelser"
];
