"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { aspectClassLabel, calculateResult, classifyAspect } from "@kg/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QuizFlow, type QuizPrompt, type QuizSource } from "@/components/miljo/investigation-quiz";
import { ChemicalRegister, emptyChemical, emptyOther, emptyTrip, OtherRegister, TripRegister, type Chemical, type Other, type RegisterKind, type Trip } from "@/components/miljo/register-sections";
import { RegisterSummary } from "@/components/miljo/register-summary";

const steps = ["Grunduppgifter", "Miljöaspekter", "Register", "Lagkrav", "Sammanställning"];
type Aspect = { title: string; quantity: string; impact: string; notes: string };
type Legal = { requirement: string; status: "yes" | "no" | "not_reviewed"; method: string };
type RowSetter<T> = React.Dispatch<React.SetStateAction<T[]>>;

export function InvestigationWizard() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState({ company_name: "", organization_number: "", address: "", contact_name: "", contact_email: "" });
  const [aspects, setAspects] = useState<Aspect[]>([{ title: "", quantity: "1", impact: "1", notes: "" }]);
  const [chemicals, setChemicals] = useState<Chemical[]>([emptyChemical("chemical-1")]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [others, setOthers] = useState<Other[]>([]);
  const [legal, setLegal] = useState<Legal[]>([{ requirement: "Tillstånd och anmälningar är identifierade", status: "not_reviewed", method: "" }]);
  const [quizQueue, setQuizQueue] = useState<QuizPrompt[] | null>(null);
  const [quizDraft, setQuizDraft] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const nextId = useRef(2);

  const score = useMemo(
    () => aspects.reduce((sum, row) => sum + calculateResult(Number(row.quantity || 0), Number(row.impact || 0)), 0),
    [aspects]
  );
  const significantCount = useMemo(
    () => aspects.filter((row) => classifyAspect(calculateResult(Number(row.quantity || 0), Number(row.impact || 0))) === "betydande").length,
    [aspects]
  );
  const activeQuiz = quizQueue?.[0];

  function createId(kind: RegisterKind) {
    return `${kind}-${nextId.current++}`;
  }

  function updateRegisterRow<T extends { saved: boolean }>(setter: RowSetter<T>, index: number, key: keyof T, value: T[keyof T]) {
    setter(rows => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: value, saved: key === "saved" ? Boolean(value) : false } : row));
  }

  async function saveAndContinue() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        // Lokalt arbete tillåts utan inloggning tills Supabase-testmiljö finns.
        // Session-data behålls i komponentstate; permanent molnlagring kräver auth + org-medlemskap.
        setSaved(true);
        setStep(current => Math.min(current + 1, steps.length - 1));
        return;
      }
      if (step === 0) {
        const { data: membership } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", userData.user.id)
          .limit(1)
          .maybeSingle();
        const organizationId = membership?.organization_id;
        if (!organizationId) {
          // Säkerhetsfix: auto-join till en delad org är borttagen.
          // Användaren måste redan vara medlem i en organisation via serverside-flöde.
          console.warn("Ingen organisationsmedlemskap hittades. Sparar endast lokalt i sessionen.");
        } else {
          const { data: investigation } = await supabase
            .from("investigations")
            .insert({
              organization_id: organizationId,
              title: company.company_name || "Ny miljöutredning",
              status: "in_progress"
            })
            .select("id")
            .single();
          if (investigation) {
            await supabase.from("investigation_company").upsert({
              investigation_id: investigation.id,
              ...company,
              company_name: company.company_name || "Ny miljöutredning"
            });
          }
        }
      }
      setSaved(true);
      setStep(current => Math.min(current + 1, steps.length - 1));
    } catch (error) {
      console.warn("Kunde inte spara till molnet, fortsätter lokalt i sessionen.", error);
      setSaved(true);
      setStep(current => Math.min(current + 1, steps.length - 1));
    } finally {
      setSaving(false);
    }
  }

  function enqueueQuiz(prompt: QuizPrompt) {
    if (!quizQueue) setQuizDraft(quizAnswers[prompt.answerKey] ?? "");
    setQuizQueue(current => current ? [...current, prompt] : [prompt]);
  }

  function askForRow(kind: RegisterKind, index: number) {
    let source: QuizSource;
    let answerKey: string;
    let context: string;
    if (kind === "chemical") {
      const row = chemicals[index];
      source = "MU-07";
      answerKey = `${row.id}-MU-07`;
      context = row.product;
      updateRegisterRow(setChemicals, index, "saved", true);
    } else if (kind === "trip") {
      const row = trips[index];
      source = "MU-13";
      answerKey = `${row.id}-MU-13`;
      context = row.vehicle;
      updateRegisterRow(setTrips, index, "saved", true);
    } else {
      const row = others[index];
      source = row.category === "förbrukning" ? "MU-05" : row.category === "avfall" ? "MU-08" : "MU-11";
      answerKey = `${row.id}-${source}`;
      context = row.post;
      updateRegisterRow(setOthers, index, "saved", true);
    }
    enqueueQuiz({ source, answerKey, context });
  }

  function startQuiz(prompts: QuizPrompt[]) {
    if (!prompts.length || quizQueue) return;
    setQuizDraft(quizAnswers[prompts[0].answerKey] ?? "");
    setQuizQueue(prompts);
  }

  function finishQuiz(answer?: string) {
    if (!activeQuiz) return;
    if (answer !== undefined)     setQuizAnswers(current => ({ ...current, [activeQuiz.answerKey]: answer }));
    const remaining = quizQueue?.slice(1) ?? [];
    setQuizQueue(remaining.length ? remaining : null);
    setQuizDraft(remaining.length ? quizAnswers[remaining[0].answerKey] ?? "" : "");
  }

  const field = (label: string, value: string, onChange: (value: string) => void, type = "text") => <label className="flex flex-col gap-2 text-sm font-medium">{label}<Input type={type} value={value} onChange={event => onChange(event.target.value)} /></label>;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-5 py-8 lg:py-12">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Till översikten</Link>
        <div className="mt-10 flex flex-col gap-2">
          <p className="text-sm font-medium text-primary">Ny utredning · Steg {step + 1} av {steps.length}</p>
          <h1 className="text-4xl font-semibold tracking-tight">{steps[step]}</h1>
          <p className="leading-7 text-muted-foreground">En rad, ett kort. Lägg till bara det som gäller er verksamhet.</p>
        </div>
        <div className="mt-8 flex gap-2" aria-label="Utredningens steg">{steps.map((label, index) => <div key={label} className={`h-1.5 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} aria-label={label} aria-current={index === step ? "step" : undefined} />)}</div>

        <Card className="mt-8">
          <CardHeader><CardTitle>{step === 0 ? "Grunduppgifter" : step === 1 ? "Bedöm verksamhetens miljöaspekter" : step === 2 ? "Register: kemikalier, resor och övrigt" : step === 3 ? "Bindande krav" : "Sammanställning"}</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-6">
            {step === 0 && <div className="grid gap-6 sm:grid-cols-2">{field("Företag eller organisation", company.company_name, value => setCompany({ ...company, company_name: value }))}{field("Organisationsnummer", company.organization_number, value => setCompany({ ...company, organization_number: value }))}{field("Adress", company.address, value => setCompany({ ...company, address: value }))}{field("Kontaktperson", company.contact_name, value => setCompany({ ...company, contact_name: value }))}{field("Kontakt-e-post", company.contact_email, value => setCompany({ ...company, contact_email: value }), "email")}</div>}

            {step === 1 && <>
              <div className="flex flex-col gap-4">{aspects.map((row, index) => {
                const result = calculateResult(Number(row.quantity || 0), Number(row.impact || 0));
                const classification = classifyAspect(result);
                return (
                  <Card key={index}>
                    <CardContent className="grid gap-3 p-4 sm:grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_1.2fr_auto]">
                      {field("Aspekt", row.title, value => setAspects(rows => rows.map((item, itemIndex) => itemIndex === index ? { ...item, title: value } : item)))}
                      <label className="flex flex-col gap-2 text-sm font-medium">Mängd (1–3)
                        <Input type="number" min={1} max={3} value={row.quantity} onChange={event => setAspects(rows => rows.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: event.target.value } : item))} />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-medium">Miljöpåverkan (1–6)
                        <Input type="number" min={1} max={6} value={row.impact} onChange={event => setAspects(rows => rows.map((item, itemIndex) => itemIndex === index ? { ...item, impact: event.target.value } : item))} />
                      </label>
                      <div className="flex flex-col gap-2 text-sm">
                        <span className="font-medium">Resultat</span>
                        <span className="text-muted-foreground">{result || "–"} · {aspectClassLabel(classification)}</span>
                      </div>
                      {field("Anteckning", row.notes, value => setAspects(rows => rows.map((item, itemIndex) => itemIndex === index ? { ...item, notes: value } : item)))}
                      <Button type="button" variant="ghost" size="icon" onClick={() => setAspects(rows => rows.filter((_, itemIndex) => itemIndex !== index))} aria-label="Ta bort aspekt"><Trash2 /></Button>
                    </CardContent>
                  </Card>
                );
              })}</div>
              <Button type="button" variant="outline" className="self-start" onClick={() => setAspects(rows => [...rows, { title: "", quantity: "1", impact: "1", notes: "" }])}><Plus data-icon="inline-start" /> Lägg till aspekt</Button>
              <p className="text-sm text-muted-foreground">Summa resultat: <strong className="text-foreground">{score}</strong> · Betydande aspekter: <strong className="text-foreground">{significantCount}</strong></p>
            </>}

            {step === 2 && <div className="flex flex-col gap-8">
              <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">Registerrader och quizsvar sparas tillfälligt i den här sessionen. De sparas inte till databasen ännu.</p>
              <ChemicalRegister rows={chemicals} onAdd={() => setChemicals(rows => [...rows, emptyChemical(createId("chemical"))])} onChange={(index, key, value) => updateRegisterRow(setChemicals, index, key, value)} onRemove={index => setChemicals(rows => rows.filter((_, rowIndex) => rowIndex !== index))} onSave={index => updateRegisterRow(setChemicals, index, "saved", true)} onQuiz={askForRow} onNone={() => enqueueQuiz({ source: "MU-07", answerKey: "no-chemicals-MU-07", emptyEntry: "inga" })} />
              <TripRegister rows={trips} onAdd={() => setTrips(rows => [...rows, emptyTrip(createId("trip"))])} onChange={(index, key, value) => updateRegisterRow(setTrips, index, key, value)} onRemove={index => setTrips(rows => rows.filter((_, rowIndex) => rowIndex !== index))} onSave={index => updateRegisterRow(setTrips, index, "saved", true)} onQuiz={askForRow} onNone={() => enqueueQuiz({ source: "MU-13", answerKey: "no-trips-MU-13", emptyEntry: "inga tjänsteresor" })} />
              <OtherRegister rows={others} onAdd={() => setOthers(rows => [...rows, emptyOther(createId("other"))])} onChange={(index, key, value) => updateRegisterRow(setOthers, index, key, value)} onRemove={index => setOthers(rows => rows.filter((_, rowIndex) => rowIndex !== index))} onSave={index => updateRegisterRow(setOthers, index, "saved", true)} onQuiz={askForRow} />
            </div>}

            {step === 3 && <div className="flex flex-col gap-4">{legal.map((row, index) => <Card key={index}><CardContent className="grid gap-3 p-4 lg:grid-cols-[1.5fr_0.7fr_1fr]">{field("Krav", row.requirement, value => setLegal(rows => rows.map((item, itemIndex) => itemIndex === index ? { ...item, requirement: value } : item)))}<label className="flex flex-col gap-2 text-sm font-medium">Status<select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={row.status} onChange={event => setLegal(rows => rows.map((item, itemIndex) => itemIndex === index ? { ...item, status: event.target.value as Legal["status"] } : item))}><option value="not_reviewed">Ej granskad</option><option value="yes">Uppfyllt</option><option value="no">Åtgärd krävs</option></select></label>{field("Metod", row.method, value => setLegal(rows => rows.map((item, itemIndex) => itemIndex === index ? { ...item, method: value } : item)))}</CardContent></Card>)}</div>}

            {step === 4 && <RegisterSummary aspects={aspects} chemicals={chemicals} trips={trips} others={others} onStartQuiz={startQuiz} />}

            {activeQuiz && <QuizFlow key={activeQuiz.answerKey} prompt={activeQuiz} value={quizDraft} onChange={setQuizDraft} onSubmit={() => finishQuiz(quizDraft)} onSkip={() => finishQuiz("")} onNotRelevant={() => finishQuiz("Inte relevant")} />}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <Button type="button" variant="ghost" onClick={() => setStep(current => Math.max(current - 1, 0))} disabled={step === 0}><ArrowLeft data-icon="inline-start" /> Tillbaka</Button>
              {step < steps.length - 1 ? <Button type="button" onClick={saveAndContinue} disabled={saving}>{saving ? "Sparar..." : saved ? "Sparat" : "Spara och fortsätt"}<ArrowRight data-icon="inline-end" /></Button> : <Button asChild><Link href="/dashboard"><Check data-icon="inline-start" /> Till översikten</Link></Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
