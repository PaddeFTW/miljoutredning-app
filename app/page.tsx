import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, FileText, Leaf, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sections = ["Organisation", "Lagkrav", "Energi", "Kemikalier", "Avfall", "Transport", "Arbetsmiljö"];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Leaf className="size-5" /></span>
            Miljöutredning
          </Link>
          <nav aria-label="Huvudnavigation" className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/dashboard" className="hover:text-foreground">Översikt</Link>
            <Link href="/guidance" className="hover:text-foreground">Vägledning</Link>
            <Link href="/settings" className="hover:text-foreground">Inställningar</Link>
          </nav>
          <Button asChild size="sm"><Link href="/investigation/new"><Plus data-icon="inline-start" /> Ny utredning</Link></Button>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div className="flex flex-col gap-7">
          <div className="flex items-center gap-2 text-sm font-medium text-primary"><Sparkles className="size-4" /> Miljöledning, utan onödig administration</div>
          <h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-tight text-foreground lg:text-7xl">Gör miljöutredningen tydlig, tillsammans.</h1>
          <p className="max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">En samlad arbetsyta för att kartlägga verksamheten, bedöma miljöaspekter och skapa ett underlag som håller hela vägen till uppföljning.</p>
          <div className="flex flex-wrap gap-3"><Button asChild size="lg"><Link href="/investigation/new">Starta en utredning <ArrowRight data-icon="inline-end" /></Link></Button><Button asChild variant="outline" size="lg"><Link href="/guidance">Se vägledning</Link></Button></div>
          <div className="flex flex-wrap gap-5 pt-2 text-sm text-muted-foreground"><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-success" /> Autosparat</span><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-success" /> Spårbart</span><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-success" /> Exportklart</span></div>
        </div>
        <Card className="overflow-hidden border-primary/20 bg-primary/5 shadow-token-lg"><CardHeader className="border-b bg-card/80"><div className="flex items-center justify-between"><div><CardDescription>Pågående utredning</CardDescription><CardTitle className="mt-2 text-2xl">Nordkust Produktion AB</CardTitle></div><span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">Pågår</span></div></CardHeader><CardContent className="flex flex-col gap-6 p-6"><div className="flex items-end justify-between"><div><p className="text-4xl font-semibold">12 <span className="text-base font-normal text-muted-foreground">/ 21</span></p><p className="text-sm text-muted-foreground">avsnitt genomförda</p></div><ClipboardCheck className="size-8 text-primary" /></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[57%] rounded-full bg-primary" /></div><div className="grid grid-cols-2 gap-3 text-sm">{sections.slice(0, 4).map((section, index) => <div key={section} className="flex items-center gap-2"><CheckCircle2 className={index < 3 ? "size-4 text-success" : "size-4 text-muted-foreground"} />{section}</div>)}</div><Button asChild variant="outline" className="w-full"><Link href="/dashboard">Fortsätt där du slutade <ArrowRight data-icon="inline-end" /></Link></Button></CardContent></Card>
      </section>
      <section className="border-t bg-card/50"><div className="mx-auto grid max-w-7xl gap-5 px-6 py-12 md:grid-cols-3"><Card><CardContent className="flex gap-4 p-6"><FileText className="size-6 shrink-0 text-primary" /><div><h2 className="font-semibold">Samla underlaget</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Dokument, observationer och svar på ett ställe.</p></div></CardContent></Card><Card><CardContent className="flex gap-4 p-6"><ClipboardCheck className="size-6 shrink-0 text-primary" /><div><h2 className="font-semibold">Bedöm det viktiga</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Väg samman omfattning, frekvens och konsekvens.</p></div></CardContent></Card><Card><CardContent className="flex gap-4 p-6"><Leaf className="size-6 shrink-0 text-primary" /><div><h2 className="font-semibold">Fatta beslut</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Gör resultatet begripligt och redo att dela.</p></div></CardContent></Card></div></section>
    </main>
  );
}
