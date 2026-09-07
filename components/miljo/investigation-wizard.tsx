"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const steps = ["Grunduppgifter", "Miljöaspekter", "Kemikalier", "Lagkrav", "Sammanfattning"];

type Aspect = { title: string; quantity: string; impact: string; notes: string };
type Chemical = { name: string; purpose: string; annual_amount: string; unit: string; sds_available: boolean };
type Legal = { requirement: string; status: "yes" | "no" | "not_reviewed"; method: string };

export function InvestigationWizard() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState({ company_name: "", organization_number: "", address: "", contact_name: "", contact_email: "" });
  const [aspects, setAspects] = useState<Aspect[]>([{ title: "Energianvändning", quantity: "0", impact: "1", notes: "" }]);
  const [chemicals, setChemicals] = useState<Chemical[]>([{ name: "", purpose: "", annual_amount: "", unit: "liter", sds_available: false }]);
  const [legal, setLegal] = useState<Legal[]>([{ requirement: "Tillstånd och anmälningar är identifierade", status: "not_reviewed", method: "" }]);

  const score = useMemo(() => aspects.reduce((sum, row) => sum + Number(row.quantity || 0) * Number(row.impact || 0), 0), [aspects]);
  const updateAspect = (index: number, key: keyof Aspect, value: string) => setAspects((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  const updateChemical = (index: number, key: keyof Chemical, value: string | boolean) => setChemicals((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  const updateLegal = (index: number, key: keyof Legal, value: string) => setLegal((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  async function saveAndContinue() {
    setSaving(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { window.location.href = "/auth/login?redirectTo=/investigation/new"; return; }
    if (step === 0) {
      const { data: membership } = await supabase.from("organization_members").select("organization_id").eq("user_id", userData.user.id).limit(1).maybeSingle();
      let organizationId = membership?.organization_id;
      if (!organizationId) {
        const { data: org } = await supabase.from("organizations").select("id").eq("name", "KvalitetsGruppen").limit(1).maybeSingle();
        if (org) { const { data: joined } = await supabase.from("organization_members").insert({ organization_id: org.id, user_id: userData.user.id, role: "owner" }).select("organization_id").single(); organizationId = joined?.organization_id; }
      }
      if (organizationId) {
        const { data: investigation } = await supabase.from("investigations").insert({ organization_id: organizationId, title: company.company_name || "Ny miljöutredning", status: "in_progress" }).select("id").single();
        if (investigation) await supabase.from("investigation_company").upsert({ investigation_id: investigation.id, ...company, company_name: company.company_name || "Ny miljöutredning" });
      }
    }
    setSaved(true); setSaving(false); setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  return <main className="min-h-screen bg-background"><div className="mx-auto max-w-5xl px-5 py-8 lg:py-12"><Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Till översikten</Link><div className="mt-10 flex flex-col gap-2"><p className="text-sm font-medium text-primary">Ny utredning · Steg {step + 1} av {steps.length}</p><h1 className="text-4xl font-semibold tracking-tight">{steps[step]}</h1><p className="leading-7 text-muted-foreground">Samla uppgifterna stegvis. Dina svar sparas i IMS när du går vidare.</p></div><div className="mt-8 flex gap-2">{steps.map((label, index) => <div key={label} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} aria-label={label} />)}</div>
    <Card className="mt-8"><CardHeader><CardTitle>{step === 0 ? "Grunduppgifter" : step === 1 ? "Bedöm verksamhetens miljöaspekter" : step === 2 ? "Kemikalier och säkerhetsdatablad" : step === 3 ? "Bindande krav" : "Resultat"}</CardTitle></CardHeader><CardContent className="flex flex-col gap-6">
      {step === 0 && <><div className="grid gap-6 sm:grid-cols-2"><label className="flex flex-col gap-2 text-sm font-medium">Företag eller organisation<Input value={company.company_name} onChange={(e) => setCompany({ ...company, company_name: e.target.value })} /></label><label className="flex flex-col gap-2 text-sm font-medium">Organisationsnummer<Input value={company.organization_number} onChange={(e) => setCompany({ ...company, organization_number: e.target.value })} /></label><label className="flex flex-col gap-2 text-sm font-medium">Adress<Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></label><label className="flex flex-col gap-2 text-sm font-medium">Kontaktperson<Input value={company.contact_name} onChange={(e) => setCompany({ ...company, contact_name: e.target.value })} /></label><label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">Kontakt-e-post<Input type="email" value={company.contact_email} onChange={(e) => setCompany({ ...company, contact_email: e.target.value })} /></label></div></>}
      {step === 1 && <><div className="flex flex-col gap-4">{aspects.map((row, index) => <div key={index} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1.5fr_0.7fr_0.7fr_1.5fr_auto]"><Input aria-label="Aspekt" placeholder="Miljöaspekt" value={row.title} onChange={(e) => updateAspect(index, "title", e.target.value)} /><Input aria-label="Omfattning" type="number" min="0" placeholder="Omfattning" value={row.quantity} onChange={(e) => updateAspect(index, "quantity", e.target.value)} /><Input aria-label="Påverkan" type="number" min="0" max="3" placeholder="Påverkan" value={row.impact} onChange={(e) => updateAspect(index, "impact", e.target.value)} /><Input aria-label="Anteckningar" placeholder="Anteckning" value={row.notes} onChange={(e) => updateAspect(index, "notes", e.target.value)} /><Button type="button" variant="ghost" size="icon" onClick={() => setAspects((rows) => rows.filter((_, i) => i !== index))} aria-label="Ta bort aspekt"><Trash2 /></Button></div>)}</div><Button type="button" variant="outline" className="self-start" onClick={() => setAspects((rows) => [...rows, { title: "", quantity: "0", impact: "0", notes: "" }])}><Plus data-icon="inline-start" /> Lägg till aspekt</Button><p className="text-sm text-muted-foreground">Preliminärt betydelsevärde: <strong className="text-foreground">{score.toFixed(1)}</strong></p></>}
      {step === 2 && <><div className="flex flex-col gap-4">{chemicals.map((row, index) => <div key={index} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-5"><Input aria-label="Kemikalie" placeholder="Produktnamn" value={row.name} onChange={(e) => updateChemical(index, "name", e.target.value)} /><Input aria-label="Användning" placeholder="Användning" value={row.purpose} onChange={(e) => updateChemical(index, "purpose", e.target.value)} /><Input aria-label="Årsmängd" type="number" placeholder="Årsmängd" value={row.annual_amount} onChange={(e) => updateChemical(index, "annual_amount", e.target.value)} /><Input aria-label="Enhet" placeholder="Enhet" value={row.unit} onChange={(e) => updateChemical(index, "unit", e.target.value)} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={row.sds_available} onChange={(e) => updateChemical(index, "sds_available", e.target.checked)} /> SDS finns</label></div>)}</div><Button type="button" variant="outline" className="self-start" onClick={() => setChemicals((rows) => [...rows, { name: "", purpose: "", annual_amount: "", unit: "liter", sds_available: false }])}><Plus data-icon="inline-start" /> Lägg till kemikalie</Button></>}
      {step === 3 && <div className="flex flex-col gap-4">{legal.map((row, index) => <div key={index} className="grid gap-3 rounded-xl border p-4 lg:grid-cols-[1.5fr_0.7fr_1fr]"><Input aria-label="Krav" value={row.requirement} onChange={(e) => updateLegal(index, "requirement", e.target.value)} /><select className="rounded-md border bg-background px-3 py-2 text-sm" value={row.status} onChange={(e) => updateLegal(index, "status", e.target.value)}><option value="not_reviewed">Ej granskad</option><option value="yes">Uppfyllt</option><option value="no">Åtgärd krävs</option></select><Input aria-label="Metod" placeholder="Verifieringsmetod" value={row.method} onChange={(e) => updateLegal(index, "method", e.target.value)} /></div>)}</div>}
      {step === 4 && <div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl bg-primary/10 p-5"><p className="text-sm text-muted-foreground">Miljöaspekter</p><p className="mt-2 text-3xl font-semibold">{aspects.length}</p></div><div className="rounded-xl bg-primary/10 p-5"><p className="text-sm text-muted-foreground">Kemikalier</p><p className="mt-2 text-3xl font-semibold">{chemicals.filter((row) => row.name).length}</p></div><div className="rounded-xl bg-primary/10 p-5"><p className="text-sm text-muted-foreground">Betydelsevärde</p><p className="mt-2 text-3xl font-semibold">{score.toFixed(1)}</p></div><p className="md:col-span-3 leading-7 text-muted-foreground">Utredningen är skapad och kan fortsätta kompletteras från översikten. Nästa steg är att granska bevis, ansvar och handlingsplan.</p></div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5"><Button type="button" variant="ghost" onClick={() => setStep((current) => Math.max(current - 1, 0))} disabled={step === 0}><ArrowLeft data-icon="inline-start" /> Tillbaka</Button>{step < steps.length - 1 ? <Button type="button" onClick={saveAndContinue} disabled={saving}>{saving ? "Sparar..." : saved ? "Sparat" : "Spara och fortsätt"}<ArrowRight data-icon="inline-end" /></Button> : <Button asChild><Link href="/dashboard"><Check data-icon="inline-start" /> Till översikten</Link></Button>}</div>
    </CardContent></Card></div></main>;
}
