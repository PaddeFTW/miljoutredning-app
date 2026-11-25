import Link from "next/link";
import { ArrowLeft, ArrowRight, Circle } from "lucide-react";
import { AppShell, sections } from "@/components/miljo/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function InvestigationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell
      title="Utredning"
      description="Gå igenom originalets 21 avsnitt. Inga exempelvärden visas som dina uppgifter."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" /> Översikt
        </Link>
        <Button asChild variant="outline">
          <Link href={`/investigation/${id}/review`}>
            Granska utredning <ArrowRight data-icon="inline-end" />
          </Link>
        </Button>
      </div>
      <Card className="mt-8">
        <CardContent className="p-3 sm:p-5">
          <div className="flex flex-col gap-1">
            {sections.map((section, index) => (
              <div
                key={section}
                className="flex items-center justify-between gap-4 rounded-lg px-3 py-3 text-sm"
              >
                <span className="flex items-center gap-3">
                  <Circle className="size-4 text-muted-foreground" />
                  <span>
                    {index + 1}. {section}
                  </span>
                </span>
                <span className="text-muted-foreground">Ej ifylld</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
