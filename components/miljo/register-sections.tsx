"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";

export type Chemical = {
  id: string;
  product: string;
  article: string;
  supplier: string;
  supplierContact: string;
  place: string;
  responsible: string;
  issuedBy: string;
  date: string;
  purpose: string;
  annual: string;
  unit: string;
  amount: string;
  impact: string;
  result: string;
  sds: boolean;
  manufacturer: string;
  latestEdition: string;
  latestCheck: string;
  pictogram: string;
  description: string;
  special: boolean;
  saved: boolean;
};

export type Trip = {
  id: string;
  vehicle: string;
  reg: string;
  fuel: string;
  consumption: string;
  miles: string;
  amount: string;
  impact: string;
  result: string;
  responsible: string;
  checked: string;
  factor: string;
  saved: boolean;
};

export type Other = {
  id: string;
  post: string;
  supplier: string;
  perYear: string;
  amount: string;
  impact: string;
  result: string;
  responsible: string;
  category: "förbrukning" | "avfall" | "energi";
  checked: boolean;
  saved: boolean;
};

export type RegisterKind = "chemical" | "trip" | "other";

export const emptyChemical = (id: string): Chemical => ({
  id, product: "", article: "", supplier: "", supplierContact: "", place: "", responsible: "", issuedBy: "", date: "", purpose: "", annual: "", unit: "liter", amount: "", impact: "", result: "", sds: false, manufacturer: "", latestEdition: "", latestCheck: "", pictogram: "", description: "", special: false, saved: false,
});

export const emptyTrip = (id: string): Trip => ({
  id, vehicle: "", reg: "", fuel: "", consumption: "", miles: "", amount: "", impact: "", result: "", responsible: "", checked: "", factor: "", saved: false,
});

export const emptyOther = (id: string): Other => ({
  id, post: "", supplier: "", perYear: "", amount: "", impact: "", result: "", responsible: "", category: "förbrukning", checked: false, saved: false,
});

type ChemicalRegisterProps = {
  rows: Chemical[];
  onAdd: () => void;
  onChange: (index: number, key: keyof Chemical, value: Chemical[keyof Chemical]) => void;
  onRemove: (index: number) => void;
  onSave: (index: number) => void;
  onQuiz: (kind: RegisterKind, index: number) => void;
  onNone: () => void;
};

export function ChemicalRegister({ rows, onAdd, onChange, onRemove, onSave, onQuiz, onNone }: ChemicalRegisterProps) {
  const specialRows = rows.filter(row => row.special && row.product.trim());

  return (
    <RegisterSection title="Kemikalier" count={rows.filter(row => row.product.trim()).length} onAdd={onAdd} onNone={onNone} noneLabel="Inga kemikalier">
      <div className="flex flex-col gap-4">
        {rows.map((row, index) => (
          <Card key={row.id}>
            <CardContent className="flex flex-col gap-5 p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Produkt" value={row.product} onChange={value => onChange(index, "product", value)} />
                <Field label="Artikel nr" value={row.article} onChange={value => onChange(index, "article", value)} />
                <Field label="Leverantör" value={row.supplier} onChange={value => onChange(index, "supplier", value)} />
                <Field label="Plats" value={row.place} onChange={value => onChange(index, "place", value)} />
                <Field label="Ansvarig" value={row.responsible} onChange={value => onChange(index, "responsible", value)} />
                <Field label="Utfärdat av" value={row.issuedBy} onChange={value => onChange(index, "issuedBy", value)} />
                <Field label="Datum" type="date" value={row.date} onChange={value => onChange(index, "date", value)} />
                <Field label="Användning" value={row.purpose} onChange={value => onChange(index, "purpose", value)} />
                <Field label="Årsmängd" type="number" value={row.annual} onChange={value => onChange(index, "annual", value)} />
                <Field label="Enhet" value={row.unit} onChange={value => onChange(index, "unit", value)} />
                <Field label="Mängd" value={row.amount} onChange={value => onChange(index, "amount", value)} />
                <Field label="Påverkan" value={row.impact} onChange={value => onChange(index, "impact", value)} />
                <Field label="Resultat" value={row.result} onChange={value => onChange(index, "result", value)} />
                <BooleanField label="Säkerhetsdatablad finns" checked={row.sds} onChange={value => onChange(index, "sds", value)} />
                <BooleanField label="Kräver särskild hantering" checked={row.special} onChange={value => onChange(index, "special", value)} />
              </div>

              <details className="group rounded-lg border border-border">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium marker:hidden">
                  <span className="flex items-center justify-between gap-3">Detalj och kontroll <span className="text-muted-foreground group-open:rotate-180" aria-hidden="true">⌄</span></span>
                </summary>
                <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Leverantörskontakt" value={row.supplierContact} onChange={value => onChange(index, "supplierContact", value)} />
                  <Field label="Tillverkare" value={row.manufacturer} onChange={value => onChange(index, "manufacturer", value)} />
                  <Field label="Senaste utgåva" type="date" value={row.latestEdition} onChange={value => onChange(index, "latestEdition", value)} />
                  <Field label="Senaste kontroll" type="date" value={row.latestCheck} onChange={value => onChange(index, "latestCheck", value)} />
                  <Field label="Farosymbol/piktogram" value={row.pictogram} onChange={value => onChange(index, "pictogram", value)} />
                  <Field label="Beskrivning" value={row.description} onChange={value => onChange(index, "description", value)} />
                  <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-4">Ange symbolen från produktens säkerhetsdatablad. Hitta inte på farosymboler.</p>
                </div>
              </details>

              <RowActions saved={row.saved} onSave={() => onSave(index)} onQuiz={() => onQuiz("chemical", index)} onRemove={() => onRemove(index)} canSave={Boolean(row.product.trim())} />
            </CardContent>
          </Card>
        ))}
      </div>
      <section aria-labelledby="build-sds-heading" className="flex flex-col gap-3">
        <div>
          <h3 id="build-sds-heading" className="text-lg font-semibold">Bygg-SDB</h3>
          <p className="text-sm text-muted-foreground">Endast produkter som markerats för särskild hantering visas här.</p>
        </div>
        {specialRows.length ? specialRows.map(row => (
          <Card key={row.id}>
            <CardContent className="grid gap-3 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <p className="font-medium">{row.product}</p>
              <p className="text-muted-foreground">SDB: {row.sds ? "Ja" : "Nej"}</p>
              <p className="text-muted-foreground">Ansvarig: {row.responsible || "—"}</p>
              <p className="text-muted-foreground">Datum: {row.date || "—"}</p>
            </CardContent>
          </Card>
        )) : <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">Inga produkter är markerade för särskild hantering.</p>}
      </section>
    </RegisterSection>
  );
}

type TripRegisterProps = {
  rows: Trip[];
  onAdd: () => void;
  onChange: (index: number, key: keyof Trip, value: Trip[keyof Trip]) => void;
  onRemove: (index: number) => void;
  onSave: (index: number) => void;
  onQuiz: (kind: RegisterKind, index: number) => void;
  onNone: () => void;
};

export function TripRegister({ rows, onAdd, onChange, onRemove, onSave, onQuiz, onNone }: TripRegisterProps) {
  return (
    <RegisterSection title="Tjänsteresor" count={rows.filter(row => row.vehicle.trim()).length} onAdd={onAdd} onNone={onNone} noneLabel="Inga tjänsteresor">
      <div className="flex flex-col gap-4">
        {rows.map((row, index) => (
          <Card key={row.id}>
            <CardContent className="flex flex-col gap-5 p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Fordon" value={row.vehicle} onChange={value => onChange(index, "vehicle", value)} />
                <Field label="Reg.nr" value={row.reg} onChange={value => onChange(index, "reg", value)} />
                <Field label="Drivmedel" value={row.fuel} onChange={value => onChange(index, "fuel", value)} />
                <Field label="Förbrukning" value={row.consumption} onChange={value => onChange(index, "consumption", value)} />
                <Field label="Mil/år" type="number" value={row.miles} onChange={value => onChange(index, "miles", value)} />
                <Field label="Mängd" value={row.amount} onChange={value => onChange(index, "amount", value)} />
                <Field label="Påverkan" value={row.impact} onChange={value => onChange(index, "impact", value)} />
                <Field label="Resultat" value={row.result} onChange={value => onChange(index, "result", value)} />
                <Field label="Ansvarig" value={row.responsible} onChange={value => onChange(index, "responsible", value)} />
                <Field label="Kontrollerat" type="date" value={row.checked} onChange={value => onChange(index, "checked", value)} />
                <Field label="CO₂-faktor, om känd" value={row.factor} onChange={value => onChange(index, "factor", value)} />
              </div>
              {row.factor && <p className="text-sm text-muted-foreground">Angiven CO₂-faktor: {row.factor}. Inga CO₂-tal uppskattas automatiskt.</p>}
              <p className="text-sm text-muted-foreground">Referens: <span className="underline underline-offset-4">Siffror Energimyndigheten</span></p>
              <RowActions saved={row.saved} onSave={() => onSave(index)} onQuiz={() => onQuiz("trip", index)} onRemove={() => onRemove(index)} canSave={Boolean(row.vehicle.trim())} />
            </CardContent>
          </Card>
        ))}
      </div>
    </RegisterSection>
  );
}

type OtherRegisterProps = {
  rows: Other[];
  onAdd: () => void;
  onChange: (index: number, key: keyof Other, value: Other[keyof Other]) => void;
  onRemove: (index: number) => void;
  onSave: (index: number) => void;
  onQuiz: (kind: RegisterKind, index: number) => void;
};

export function OtherRegister({ rows, onAdd, onChange, onRemove, onSave, onQuiz }: OtherRegisterProps) {
  return (
    <RegisterSection title="Övrigt" count={rows.filter(row => row.post.trim()).length} onAdd={onAdd}>
      <div className="flex flex-col gap-4">
        {rows.map((row, index) => (
          <Card key={row.id}>
            <CardContent className="flex flex-col gap-5 p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Post" value={row.post} onChange={value => onChange(index, "post", value)} />
                <Field label="Leverantör" value={row.supplier} onChange={value => onChange(index, "supplier", value)} />
                <Field label="Per år" value={row.perYear} onChange={value => onChange(index, "perYear", value)} />
                <Field label="Mängd" value={row.amount} onChange={value => onChange(index, "amount", value)} />
                <Field label="Påverkan" value={row.impact} onChange={value => onChange(index, "impact", value)} />
                <Field label="Resultat" value={row.result} onChange={value => onChange(index, "result", value)} />
                <Field label="Ansvarig" value={row.responsible} onChange={value => onChange(index, "responsible", value)} />
                <label className="flex flex-col gap-2 text-sm font-medium">Kategori
                  <Select value={row.category} onValueChange={value => onChange(index, "category", value as Other["category"])}>
                    <SelectTrigger aria-label="Kategori"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="förbrukning">Förbrukning</SelectItem>
                        <SelectItem value="avfall">Avfall</SelectItem>
                        <SelectItem value="energi">Energi</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </label>
                <BooleanField label="Kontrollerat" checked={row.checked} onChange={value => onChange(index, "checked", value)} />
              </div>
              <RowActions saved={row.saved} onSave={() => onSave(index)} onQuiz={() => onQuiz("other", index)} onRemove={() => onRemove(index)} canSave={Boolean(row.post.trim())} />
            </CardContent>
          </Card>
        ))}
      </div>
    </RegisterSection>
  );
}

function RegisterSection({ title, count, onAdd, onNone, noneLabel, children }: { title: string; count: number; onAdd: () => void; onNone?: () => void; noneLabel?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4" aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-xl font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{count} {count === 1 ? "rad" : "rader"}</p></div>
        <div className="flex flex-wrap items-center gap-2">
          {onNone && noneLabel && <Button type="button" variant="ghost" onClick={onNone}>{noneLabel}</Button>}
          <Button type="button" variant="outline" onClick={onAdd}><Plus data-icon="inline-start" /> Lägg till</Button>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="flex flex-col gap-2 text-sm font-medium">{label}<Input type={type} value={value} onChange={event => onChange(event.target.value)} /></label>;
}

function BooleanField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex min-h-10 items-center gap-2 text-sm font-medium"><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="size-4 accent-primary" />{label}</label>;
}

function RowActions({ saved, onSave, onQuiz, onRemove, canSave }: { saved: boolean; onSave: () => void; onQuiz: () => void; onRemove: () => void; canSave: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
      <Button type="button" size="sm" onClick={() => { onSave(); onQuiz(); }} disabled={!canSave}>{saved ? "Sparad igen" : "Spara rad"}</Button>
      {saved && <Badge variant="secondary">Sparad i sessionen</Badge>}
      <Button type="button" variant="ghost" size="icon" className="ml-auto" onClick={onRemove} aria-label="Ta bort rad"><Trash2 /></Button>
    </div>
  );
}
