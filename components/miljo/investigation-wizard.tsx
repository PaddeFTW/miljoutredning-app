"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const steps = ["Grunduppgifter", "Miljöaspekter", "Register", "Lagkrav", "Sammanställning"];
type Aspect = { title: string; quantity: string; impact: string; notes: string };
type Chemical = { product: string; article: string; supplier: string; place: string; responsible: string; issuedBy: string; date: string; purpose: string; annual: string; unit: string; sds: boolean; manufacturer: string; latestEdition: string; latestCheck: string; pictogram: string; description: string; special: boolean };
type Trip = { vehicle: string; reg: string; fuel: string; consumption: string; miles: string; amount: string; impact: string; result: string; responsible: string; checked: boolean; factor: string };
type Other = { post: string; supplier: string; perYear: string; amount: string; impact: string; result: string; responsible: string; category: "förbrukning" | "avfall" | "energi"; checked: boolean };
type Legal = { requirement: string; status: "yes" | "no" | "not_reviewed"; method: string };

const emptyChemical = (): Chemical => ({ product: "", article: "", supplier: "", place: "", responsible: "", issuedBy: "", date: "", purpose: "", annual: "", unit: "liter", sds: false, manufacturer: "", latestEdition: "", latestCheck: "", pictogram: "", description: "", special: false });
const emptyTrip = (): Trip => ({ vehicle: "", reg: "", fuel: "", consumption: "", miles: "", amount: "", impact: "", result: "", responsible: "", checked: false, factor: "" });
const emptyOther = (): Other => ({ post: "", supplier: "", perYear: "", amount: "", impact: "", result: "", responsible: "", category: "förbrukning", checked: false });

export function InvestigationWizard() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [company, setCompany] = useState({ company_name: "", organization_number: "", address: "", contact_name: "", contact_email: "" });
  const [aspects, setAspects] = useState<Aspect[]>([{ title: "Energianvändning", quantity: "0", impact: "1", notes: "" }]);
  const [chemicals, setChemicals] = useState<Chemical[]>([emptyChemical()]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [others, setOthers] = useState<Other[]>([]);
  const [legal, setLegal] = useState<Legal[]>([{ requirement: "Tillstånd och anmälningar är identifierade", status: "not_reviewed", method: "" }]);

  const score = useMemo(() => aspects.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.impact || 0), 0), [aspects]);

  const update = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, key: keyof T, value: T[keyof T]) => setter(rows => rows.map((row, i) => i === index ? { ...row, [key]: value } : row));

  async function saveAndContinue() {
    setSaving(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      window.location.href = "/auth/login?redirectTo=/investigation/new";
      return;
    }
    if (step === 0) {
      const { data: membership } = await supabase.from("organization_members").select("organization_id").eq("user_id", userData.user.id).limit(1).maybeSingle();
      let organizationId = membership?.organization_id;
      if (!organizationId) {
        const { data: org } = await supabase.from("organizations").select("id").eq("name", "KvalitetsGruppen").limit(1).maybeSingle();
        if (org) {
          const { data: joined } = await supabase.from("organization_members").insert({ organization_id: org.id, user_id: userData.user.id, role: "owner" }).select("organization_id").single();
          organizationId = joined?.organization_id;
        }
      }
      if (organizationId) {
        const { data: investigation } = await supabase.from("investigations").insert({ organization_id: organizationId, title: company.company_name || "Ny miljöutredning", status: "in_progress" }).select("id").single();
        if (investigation) await supabase.from("investigation_company").upsert({ investigation_id: investigation.id, ...company, company_name: company.company_name || "Ny miljöutredning" });
      }
    }
    setSaved(true);
    setSaving(false);
    setQuiz(step === 2);
    setStep(current => Math.min(current + 1, steps.length - 1));
  }

  const field = (label: string, value: string, onChange: (value: string) => void, type = "text") => <label className="flex flex-col gap-2 text-sm font-medium">{label}<Input type={type} value={value} onChange={e => onChange(e.target.value)} /></label>;

  return <main className="min-h-screen bg-background"><div className="mx-auto max-w-6xl px-5 py-8 lg:py-12"><Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Till översikten</Link><div className="mt-10 flex flex-col gap-2"><p className="text-sm font-medium text-primary">Ny utredning · Steg {step + 1} av {steps.length}</p><h1 className="text-4xl font-semibold tracking-tight">{steps[step]}</h1><p className="leading-7 text-muted-foreground">En rad, ett kort. Lägg till bara det som gäller er verksamhet.</p></div><div className="mt-8 flex gap-2">{steps.map((label, index) => <div key={label} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} aria-label={label} />)}</div>
    <Card className="mt-8"><CardHeader><CardTitle>{step === 0 ? "Grunduppgifter" : step === 1 ? "Bedöm verksamhetens miljöaspekter" : step === 2 ? "Register: kemikalier, resor och övrigt" : step === 3 ? "Bindande krav" : "Sammanställning"}</CardTitle></CardHeader><CardContent className="flex flex-col gap-6">
      {step === 0 && <div className="grid gap-6 sm:grid-cols-2">{field("Företag eller organisation", company.company_name, v => setCompany({ ...company, company_name: v }))}{field("Organisationsnummer", company.organization_number, v => setCompany({ ...company, organization_number: v }))}{field("Adress", company.address, v => setCompany({ ...company, address: v }))}{field("Kontaktperson", company.contact_name, v => setCompany({ ...company, contact_name: v }))}{field("Kontakt-e-post", company.contact_email, v => setCompany({ ...company, contact_email: v }), "email")}</div>}
      {step === 1 && <><div className="flex flex-col gap-4">{aspects.map((row, i) => <Card key={i}><CardContent className="grid gap-3 p-4 sm:grid-cols-[1.5fr_0.7fr_0.7fr_1.5fr_auto]">{field("Aspekt", row.title, v => update(setAspects, i, "title", v))}{field("Omfattning", row.quantity, v => update(setAspects, i, "quantity", v), "number")}{field("Påverkan", row.impact, v => update(setAspects, i, "impact", v), "number")}{field("Anteckning", row.notes, v => update(setAspects, i, "notes", v))}<Button variant="ghost" size="icon" onClick={() => setAspects(r => r.filter((_, x) => x !== i))} aria-label="Ta bort aspekt"><Trash2 /></Button></CardContent></Card>)}</div><Button type="button" variant="outline" className="self-start" onClick={() => setAspects(r => [...r, { title: "", quantity: "0", impact: "0", notes: "" }])}><Plus data-icon="inline-start" /> Lägg till aspekt</Button><p className="text-sm text-muted-foreground">Preliminärt betydelsevärde: <strong className="text-foreground">{score.toFixed(1)}</strong></p></>}
      {step === 2 && <div className="flex flex-col gap-8"><Register title="Kemikalier" count={chemicals.filter(r => r.product).length} action={() => setChemicals(r => [...r, emptyChemical()])}><div className="flex flex-col gap-4">{chemicals.map((row, i) => <Card key={i}><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">{field("Produkt", row.product, v => update(setChemicals, i, "product", v))}{field("Artikel nr", row.article, v => update(setChemicals, i, "article", v))}{field("Leverantör", row.supplier, v => update(setChemicals, i, "supplier", v))}{field("Plats", row.place, v => update(setChemicals, i, "place", v))}{field("Ansvarig", row.responsible, v => update(setChemicals, i, "responsible", v))}{field("Utfärdat av", row.issuedBy, v => update(setChemicals, i, "issuedBy", v))}{field("Datum", row.date, v => update(setChemicals, i, "date", v), "date")}{field("Användning", row.purpose, v => update(setChemicals, i, "purpose", v))}{field("Årsmängd", row.annual, v => update(setChemicals, i, "annual", v), "number")}{field("Enhet", row.unit, v => update(setChemicals, i, "unit", v))}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={row.sds} onChange={e => update(setChemicals, i, "sds", e.target.checked)} /> SDB finns</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={row.special} onChange={e => update(setChemicals, i, "special", e.target.checked)} /> Kräver särskild hantering</label><div className="sm:col-span-2 lg:col-span-4 border-t pt-4"><p className="mb-3 text-sm font-medium">Detalj och kontroll</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{field("Leverantörskontakt", row.supplier, v => update(setChemicals, i, "supplier", v))}{field("Tillverkare", row.manufacturer, v => update(setChemicals, i, "manufacturer", v))}{field("Senaste utgåva", row.latestEdition, v => update(setChemicals, i, "latestEdition", v), "date")}{field("Senaste kontroll", row.latestCheck, v => update(setChemicals, i, "latestCheck", v), "date")}{field("Farosymbol/piktogram", row.pictogram, v => update(setChemicals, i, "pictogram", v))}{field("Beskrivning", row.description, v => update(setChemicals, i, "description", v))}</div></div><Button variant="ghost" size="icon" onClick={() => setChemicals(r => r.filter((_, x) => x !== i))} aria-label="Ta bort kemikalie"><Trash2 /></Button></CardContent></Card>)}</div></Register>
      <Register title="Tjänsteresor" count={trips.length} action={() => setTrips(r => [...r, emptyTrip()])}><div className="flex flex-col gap-4">{trips.map((row, i) => <Card key={i}><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">{field("Fordon", row.vehicle, v => update(setTrips, i, "vehicle", v))}{field("Reg.nr", row.reg, v => update(setTrips, i, "reg", v))}{field("Drivmedel", row.fuel, v => update(setTrips, i, "fuel", v))}{field("Förbrukning", row.consumption, v => update(setTrips, i, "consumption", v))}{field("Mil/år", row.miles, v => update(setTrips, i, "miles", v), "number")}{field("Mängd", row.amount, v => update(setTrips, i, "amount", v))}{field("Påverkan", row.impact, v => update(setTrips, i, "impact", v))}{field("Resultat", row.result, v => update(setTrips, i, "result", v))}{field("Ansvarig", row.responsible, v => update(setTrips, i, "responsible", v))}{field("CO₂-faktor, om känd", row.factor, v => update(setTrips, i, "factor", v))}<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={row.checked} onChange={e => update(setTrips, i, "checked", e.target.checked)} /> Kontrollerat</label><Button variant="ghost" size="icon" onClick={() => setTrips(r => r.filter((_, x) => x !== i))} aria-label="Ta bort resa"><Trash2 /></Button><p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">CO₂ beräknas inte utan angiven faktor. <span className="underline">Siffror Energimyndigheten</span></p></CardContent></Card>)}</div></Register>
      <Register title="Övrigt" count={others.length} action={() => setOthers(r => [...r, emptyOther()])}><div className="flex flex-col gap-4">{others.map((row, i) => <Card key={i}><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">{field("Post", row.post, v => update(setOthers, i, "post", v))}{field("Leverantör", row.supplier, v => update(setOthers, i, "supplier", v))}{field("Per år", row.perYear, v => update(setOthers, i, "perYear", v))}{field("Mängd", row.amount, v => update(setOthers, i, "amount", v))}{field("Påverkan", row.impact, v => update(setOthers, i, "impact", v))}{field("Resultat", row.result, v => update(setOthers, i, "result", v))}{field("Ansvarig", row.responsible, v => update(setOthers, i, "responsible", v))}<label className="flex flex-col gap-2 text-sm font-medium">Kategori<select className="h-10 rounded-md border bg-background px-3 text-sm" value={row.category} onChange={e => update(setOthers, i, "category", e.target.value as Other["category"])}><option>förbrukning</option><option>avfall</option><option>energi</option></select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={row.checked} onChange={e => update(setOthers, i, "checked", e.target.checked)} /> Kontrollerat</label><Button variant="ghost" size="icon" onClick={() => setOthers(r => r.filter((_, x) => x !== i))} aria-label="Ta bort post"><Trash2 /></Button></CardContent></Card>)}</div></Register></div>}
      {step === 3 && <div className="flex flex-col gap-4">{legal.map((row, i) => <Card key={i}><CardContent className="grid gap-3 p-4 lg:grid-cols-[1.5fr_0.7fr_1fr]">{field("Krav", row.requirement, v => update(setLegal, i, "requirement", v))}<select className="h-10 rounded-md border bg-background px-3 text-sm" value={row.status} onChange={e => update(setLegal, i, "status", e.target.value as Legal["status"])}><option value="not_reviewed">Ej granskad</option><option value="yes">Uppfyllt</option><option value="no">Åtgärd krävs</option></select>{field("Metod", row.method, v => update(setLegal, i, "method", v))}</CardContent></Card>)}</div>}
      {step === 4 && <div className="flex flex-col gap-6"><div className="grid gap-4 sm:grid-cols-3"><Summary label="Betydande rader" value={String(aspects.filter(r => Number(r.quantity) * Number(r.impact) > 0).length + others.filter(r => Number(r.impact) > 0).length)} /><Summary label="Kemikalier" value={String(chemicals.filter(r => r.product).length)} /><Summary label="Resor" value={String(trips.length)} /></div><div className="flex flex-col gap-3">{[...chemicals.filter(r => r.product), ...trips.filter(r => r.vehicle), ...others.filter(r => r.post)].map((row, i) => <div key={i} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 text-sm"><span>{"product" in row ? row.product : "vehicle" in row ? row.vehicle : row.post}</span><Badge variant="secondary">{"category" in row ? row.category : "product" in row ? "kemikalie" : "tjänsteresa"}</Badge></div>)}</div>{quiz && <Card className="border-primary/30 bg-primary/5"><CardContent className="flex flex-col gap-3 p-5"><Badge className="w-fit">Nästa fråga</Badge><h2 className="text-lg font-semibold">Finns det någon risk eller särskild hantering som behöver följas upp?</h2><Input placeholder="Skriv ditt svar" value={quizAnswer} onChange={e => setQuizAnswer(e.target.value)} /><Button className="w-fit" onClick={() => setQuiz(false)}>Spara svar</Button></CardContent></Card>}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5"><Button type="button" variant="ghost" onClick={() => setStep(current => Math.max(current - 1, 0))} disabled={step === 0}><ArrowLeft data-icon="inline-start" /> Tillbaka</Button>{step < steps.length - 1 ? <Button type="button" onClick={saveAndContinue} disabled={saving}>{saving ? "Sparar..." : saved ? "Sparat" : "Spara och fortsätt"}<ArrowRight data-icon="inline-end" /></Button> : <Button asChild><Link href="/dashboard"><Check data-icon="inline-start" /> Till översikten</Link></Button>}</div>
    </CardContent></Card></div></main>;
}

function Register({ title, count, action, children }: { title: string; count: number; action: () => void; children: React.ReactNode }) {
  return <section className="flex flex-col gap-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{count} {count === 1 ? "rad" : "rader"}</p></div><Button variant="outline" onClick={action}><Plus data-icon="inline-start" /> Lägg till</Button></div>{children}</section>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-primary/10 p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}
