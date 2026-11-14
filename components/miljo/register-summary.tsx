"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Chemical, Other, Trip } from "@/components/miljo/register-sections";
import type { QuizPrompt } from "@/components/miljo/investigation-quiz";

type Aspect = { title: string; quantity: string; impact: string; notes: string };

export function RegisterSummary({ aspects, chemicals, trips, others, onStartQuiz }: {
  aspects: Aspect[];
  chemicals: Chemical[];
  trips: Trip[];
  others: Other[];
  onStartQuiz: (prompts: QuizPrompt[]) => void;
}) {
  const significantAspects = aspects.filter(row => row.title.trim() && Number(row.quantity || 0) * Number(row.impact || 0) > 0);
  const products = chemicals.filter(row => row.product.trim());
  const journeys = trips.filter(row => row.vehicle.trim());
  const otherRows = others.filter(row => row.post.trim());
  const records = [
    ...products.map(row => ({ id: row.id, name: row.product, area: "Kemikalie", saved: row.saved, detail: `SDB ${row.sds ? "ja" : "nej"} · mängd ${row.amount || "ej angiven"} · påverkan ${row.impact || "ej angiven"} · resultat ${row.result || "ej angivet"} · ${row.responsible || "Ingen ansvarig angiven"}` })),
    ...journeys.map(row => ({ id: row.id, name: row.vehicle, area: "Tjänsteresa", saved: row.saved, detail: `${row.fuel || "Drivmedel ej angivet"} · ${row.miles ? `${row.miles} mil/år` : "Miltal ej angivet"} · mängd ${row.amount || "ej angiven"} · påverkan ${row.impact || "ej angiven"} · resultat ${row.result || "ej angivet"}` })),
    ...otherRows.map(row => ({ id: row.id, name: row.post, area: row.category, saved: row.saved, detail: `${row.supplier || "Leverantör ej angiven"} · mängd ${row.amount || "ej angiven"} · påverkan ${row.impact || "ej angiven"} · resultat ${row.result || "ej angivet"} · ${row.responsible || "Ingen ansvarig angiven"}` })), 
  ];
  const emptyAreas = [
    { label: "Miljöaspekter", empty: !significantAspects.length },
    { label: "Kemikalier", empty: !products.length },
    { label: "Tjänsteresor", empty: !journeys.length },
    { label: "Övrigt", empty: !otherRows.length },
  ].filter(area => area.empty);

  const startSummaryQuiz = () => {
    onStartQuiz([
      { source: "MU-19", answerKey: "summary-MU-19" },
      ...significantAspects.map((row, index) => ({ source: "MU-20" as const, answerKey: `summary-MU-20-${index}`, context: row.title })),
      { source: "MU-21", answerKey: "summary-MU-21" },
      { source: "MU-21-positive", answerKey: "summary-MU-21-positive" },
    ]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryMetric label="Betydande aspekter" value={String(significantAspects.length)} />
        <SummaryMetric label="Kemikalier" value={String(products.length)} />
        <SummaryMetric label="Tjänsteresor" value={String(journeys.length)} />
        <SummaryMetric label="Övrigt" value={String(otherRows.length)} />
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="significant-aspects-heading">
        <h2 id="significant-aspects-heading" className="text-lg font-semibold">Betydande miljöaspekter</h2>
        {significantAspects.length ? significantAspects.map((row, index) => (
          <Card key={`${row.title}-${index}`}><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"><span className="font-medium">{row.title}</span><span className="text-muted-foreground">{row.quantity} × {row.impact} = {(Number(row.quantity || 0) * Number(row.impact || 0)).toFixed(1)}</span></CardContent></Card>
        )) : <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">Inga betydande miljöaspekter har identifierats ännu.</p>}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="register-lines-heading">
        <h2 id="register-lines-heading" className="text-lg font-semibold">Rader från registren</h2>
        {records.length ? records.map(row => (
          <Card key={row.id}><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="truncate font-medium">{row.name}</p><p className="text-sm text-muted-foreground">{row.detail}</p></div><div className="flex items-center gap-2"><Badge variant="secondary">{row.area}</Badge><Badge variant={row.saved ? "default" : "outline"}>{row.saved ? "Sparad i sessionen" : "Utkast"}</Badge></div></CardContent></Card>
        )) : <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">Inga registerrader har lagts till.</p>}
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="empty-areas-heading">
        <h2 id="empty-areas-heading" className="text-lg font-semibold">Ytor utan inmatning</h2>
        {emptyAreas.length ? <div className="grid gap-3 sm:grid-cols-2">{emptyAreas.map(area => <div key={area.label} className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">{area.label}: {area.label === "Miljöaspekter" ? "inga betydande rader" : "inga rader"}</div>)}</div> : <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">Alla ytor har innehåll.</p>}
      </section>

      <Card><CardHeader><CardTitle className="text-base">Quiz för sammanställningen</CardTitle></CardHeader><CardContent className="flex flex-col items-start gap-3"><p className="text-sm text-muted-foreground">Gå igenom bedömning, livscykel och sammanställning. Positiva iakttagelser är frivilliga.</p><Button type="button" variant="outline" onClick={startSummaryQuiz}>Starta quizet</Button></CardContent></Card>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-primary/10 p-4 sm:p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>;
}
