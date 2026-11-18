import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell, sections } from "@/components/miljo/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <AppShell
      title="Översikt"
      description="Starta en ny miljöutredning eller öppna vägledningen. Sparade utredningar visas här när datalagret är aktivt."
    >
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/investigation/new">
            <Plus data-icon="inline-start" /> Ny utredning
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/guidance">Öppna vägledning</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Sparade utredningar</p>
            <p className="mt-2 text-3xl font-semibold">–</p>
            <p className="mt-1 text-sm text-muted-foreground">Kräver aktiv databas eller Windows-app</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Avsnitt i originalet</p>
            <p className="mt-2 text-3xl font-semibold">{sections.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">Enligt Miljöutredning.docx</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Bedömningsmodell</p>
            <p className="mt-2 text-lg font-semibold">Mängd 1–3 × påverkan 1–6</p>
            <p className="mt-1 text-sm text-muted-foreground">13–18 = betydande</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Originalets 21 avsnitt</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {sections.map((section, index) => (
            <div key={section} className="rounded-lg border px-3 py-2 text-sm">
              <span className="text-muted-foreground">{index + 1}.</span> {section}
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
