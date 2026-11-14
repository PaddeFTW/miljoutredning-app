"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export type QuizSource = "MU-05" | "MU-07" | "MU-08" | "MU-11" | "MU-13" | "MU-19" | "MU-20" | "MU-21" | "MU-21-positive";
export type QuizPrompt = { source: QuizSource; answerKey: string; emptyEntry?: string; context?: string };

type Question = {
  question: string;
  explanation: string;
  example: string;
  tip: string;
  modelAnswer: string;
  manualText: string;
  owner: string;
  evidence: string;
  simpleWays: string;
  sourceText: string;
  optional?: boolean;
  notRelevantAllowed?: boolean;
};

const questions: Record<QuizSource, Question> = {
  "MU-05": {
    question: "Vilka förbrukningsvaror syns på fakturorna, och vilka är stora nog att tas med?",
    explanation: "Papper, emballage, dukar, handskar. Titta på inköpen för året. Pärmens poäng är ett sätt att sortera, inte det enda.",
    example: "Allmän: papper och kaffe. Städ: dukar, säckar, handskar. Bygg: emballage och förbrukning på etablering. Fastighet: lampor och förbrukning i husen. Transport: verkstadsförbrukning. Industri: förpackning kring produkten. Konsult och IT: papper och toner, ofta litet. Handel: påsar och emballage. Vård: handskar och förbrukning i vården.",
    tip: "Ta med det som köps ofta. Hoppa över sådant som knappt syns.",
    modelAnswer: "Störst förbrukning är [1], [2]. Underlag är fakturor [år]. [Namn] äger listan.",
    manualText: "Väsentlig förbrukning är identifierad och används som underlag för miljöaspekterna.",
    owner: "Den som beställer.",
    evidence: "Faktura eller uppskattning med källa.",
    simpleWays: "Tre rader från senaste inköpen. Markera den största.",
    sourceText: "pärm blankett 5; flik Övrigt. Bedömningen hör till miljöaspekterna i banken.",
  },
  "MU-07": {
    question: "Finns en lista på kemikalierna, med produkt, leverantör, plats, ansvarig och om säkerhetsdatablad finns?",
    explanation: "Listan i utredningen är en ögonblicksbild. Den levande listan och bladen ska ligga där jobbet görs. På byggprojekt skrivs de produkter som kräver särskild hantering.",
    example: "Städ: medel i bilen, blad i pärmen i bilen. Bygg: produkt, blad ja eller nej, ansvarig, datum, per projekt. Industri: förråd, mängd, symbol. Fastighet: målarfärg och avfettning i förråd. Transport: olja, spolarvätska, verkstad. Handel: det som säljs farligt, plus städ i butik. Vård: desinfektion. Konsult och IT: oftast inga, skriv det. Allmän: det som står under diskbänken.",
    tip: "Programmets flik Kemikalier har samma fält: produkt, leverantör, mängd, påverkan, resultat, ansvarig, plats, kontrollerat, symbol. Fråga tillverkare eller leverantör om symbol, hitta inte på den.",
    modelAnswer: "Kemikalier: [lista]. Säkerhetsdatablad finns för [vilka], kontrollerade [datum] av [namn]. Plats: [var].",
    manualText: "Kemikalier är förtecknade. Säkerhetsdatablad finns och hålls aktuella för de produkter som används.",
    owner: "Den som beställer medlen. På bygge: arbetsledaren.",
    evidence: "Lista och blad, eller länk till blad. Datum för senaste koll.",
    simpleWays: "Skriv det som finns i skåpet. Bocka blad ja eller nej. Ett namn.",
    sourceText: "pärm blankett 7; kemikalielista; säkerhetsdatablad för byggprojekt; flik Kemikalier. Banken: kemikalielista och säkerhetsdatablad.",
  },
  "MU-08": {
    question: "Vet ni vad som slängs, vad som är farligt avfall och vart det körs?",
    explanation: "Fakturor och hämtningsrapporter räcker. Farligt avfall ska inte ligga i hushållssoporna.",
    example: "Allmän: brännbart och papper. Städ: kundens sopor plus egna kemrester. Bygg: trä, gips, färg, el. Fastighet: miljörum. Transport: olja, filter, däck. Industri: processavfall och metall. Konsult: papper och elektronik. IT: elektronik. Handel: wellpapp och returer. Vård: smittförande separat.",
    tip: "Skriv mottagare. “Vi sorterar” utan vart det tar vägen räcker inte.",
    modelAnswer: "Avfall: [typer]. Farligt avfall: [vad] till [mottagare]. Hämtning visas med [faktura]. [Namn] ansvarar.",
    manualText: "Avfall och farligt avfall sorteras och lämnas till godkänd mottagare.",
    owner: "Den som beställer hämtning.",
    evidence: "Faktura eller rapport från hämtaren.",
    simpleWays: "Fem kärl. En mottagare för det farliga. Eller “inget farligt avfall”.",
    sourceText: "pärm blankett 8; avfall i banken.",
  },
  "MU-11": {
    question: "Vet ni ungefär hur mycket el, värme eller bränsle lokalen drar, och vem som är leverantör?",
    explanation: "Årsfakturan räcker i ett litet bolag. Månadsrader är pärmens hjälp om en månad sticker ut.",
    example: "Allmän: el till kontor. Städ: lite i egen lokal, mer i bilarna. Bygg: bod och etablering. Fastighet: husets el och värme, ofta det största. Transport: verkstad plus drivmedel i nästa fråga. Industri: processel. Konsult och IT: kontor och server. Handel: belysning och kyla. Vård: lokalens el.",
    tip: "Skriv miljömärkt bara om fakturan säger det.",
    modelAnswer: "El och värme [år] var [mängd eller “se faktura”]. Leverantör [namn]. [Namn] följer upp.",
    manualText: "Energianvändning följs upp med underlag från leverantör.",
    owner: "Den som får fakturan.",
    evidence: "Årsfaktura.",
    simpleWays: "En faktura. En mening. Inget krav på månadssplitt.",
    sourceText: "pärm blankett 11; flik Övrigt. Styrning och uppföljning i banken.",
  },
  "MU-13": {
    question: "Vilka tjänsteresor görs, med vilket fordon, och tittar ni på ett enklare färdsätt när det går?",
    explanation: "Samma fält som i programmet: fordon, registreringsnummer, drivmedel, förbrukning, mil per år, mängd, påverkan, resultat, ansvarig, kontrollerat. Flyg och tåg räknas om de finns.",
    example: "Konsult och IT: tåg eller bil till kund. Bygg: bil till plats. Städ: redan med i objektsbilarna, skriv inte dubbelt. Transport: tjänsteresor utöver körningen. Handel: inköpsresor. Vård: oftast uppdragskörning, inte tjänsteresa. Industri: få resor. Allmän: det VD faktiskt kör.",
    tip: "Skriv varför bil valdes om tåg fanns. Hitta inte på ett koldioxidtal.",
    modelAnswer: "Tjänsteresor: [bil eller tåg], [mil eller antal]. Enklare sätt valdes [ja, eller varför inte]. [Namn] kollade [datum].",
    manualText: "Tjänsteresor är kartlagda. Val av färdsätt beaktas där det är praktiskt möjligt.",
    owner: "Den som godkänner resor.",
    evidence: "Reseräkning eller miltal.",
    simpleWays: "En rad per bil. “Inga tjänsteresor” om det stämmer.",
    sourceText: "pärm blankett 13; flik Tjänsteresor. Transporter i banken.",
  },
  "MU-19": {
    question: "Har ni samlat det som kom fram och sagt vad som påverkar mest?",
    explanation: "Pärmen multiplicerar mängd med påverkan. Det är ett sätt. Ett litet bolag kan sätta störst, mittemellan och litet. Det som väger tyngst går vidare.",
    example: "Städ: kemikalier och körning. Bygg: spill och transporter. Fastighet: energi. Transport: drivmedel. Industri: el och processavfall. Konsult: resor. IT: el och elektronik. Handel: emballage och transporter. Vård: avfall och körning. Allmän: de tre som syns på fakturan.",
    tip: "Ansvarig på varje rad. Tomma blanketter ska inte in i listan.",
    modelAnswer: "Störst hos oss är [1], [2], [3]. Bedömt [datum] av [namn]. Sätt: [poäng eller enkel rangordning].",
    manualText: "Miljöaspekter är bedömda. De som påverkar mest är utpekade.",
    owner: "Miljöansvarig, med den som gör jobbet.",
    evidence: "Listan med resultat och namn.",
    simpleWays: "Flytta de ifyllda raderna hit. Stryk det som inte gäller er.",
    sourceText: "pärm blankett 19; listan på det som påverkar mest. Poängformeln är pärmens sätt, inte ett krav.",
  },
  "MU-20": {
    question: "För det som påverkar mest: finns en ansvarig, och tänker ni på inköp, användning och vad som händer sedan?",
    explanation: "Banken kallar kedjan livscykel. För er: köpa så skonsamt det går, använda utan slöseri, lämna rest till återvinning eller godkänd mottagare. “Inte relevant” är tillåtet om kedjan inte finns, till exempel ren tjänst utan vara.",
    example: "Städ: välja medel, rätt dos, rest till mottagare. Bygg: välja material, mindre spill, sortera. Fastighet: välja energi, styra driften, avfall från underhåll. Transport: drivmedel, körsätt, olja till mottagare. Industri: råvara, process, skrot. Handel: vara in, emballage, retur. Konsult och IT: resa och elektronik. Vård: förbrukning in, användning, riskavfall ut.",
    tip: "Handlingsplan bara för de betydande. Inte för varje liten rad.",
    modelAnswer: "Betydande: [rad]. Köpa: [hur]. Använda: [hur]. Sluthantering: [vart]. Ansvarig [namn]. Plan: [finns eller datum].",
    manualText: "Betydande miljöaspekter har ansvarig. Påverkan beaktas vid inköp, användning och avfallshantering.",
    owner: "Samma som äger raden.",
    evidence: "Raden plus var planen ligger.",
    simpleWays: "Tre meningar per betydande rad. Ett namn.",
    sourceText: "pärm blankett 20; livscykel i banken.",
    notRelevantAllowed: true,
  },
  "MU-21": {
    question: "Kan ni visa en samlad bild av det som kom fram, och det ni redan gör bra?",
    explanation: "Programmets flik Sammanställning är utdata. Positiva iakttagelser är frivilliga. Utan de betydande raderna är sammanställningen tom.",
    example: "Samma i alla branscher: de tre största, ansvarig, och en rad om något som redan fungerar.",
    tip: "Skriv inte om alla blanketter. Peka på listan.",
    modelAnswer: "Sammanställningen visar [de betydande]. Den ligger [var]. Bra som redan görs: [en rad eller ingen].",
    manualText: "Resultatet av miljöutredningen är sammanställt och används som underlag för löfte, mål och styrning.",
    owner: "Den som godkände utredningen.",
    evidence: "Sammanställningen, med datum.",
    simpleWays: "En sida med de betydande och nästa koll.",
    sourceText: "flik Sammanställning; pärm blankett 21.",
  },
  "MU-21-positive": {
    question: "Positiva iakttagelser är frivilliga.",
    explanation: "Det går bra att lämna den här frivilliga uppgiften tom.",
    example: "En kort rad om något som redan fungerar.",
    tip: "Det går bra att lämna den här frivilliga uppgiften tom.",
    modelAnswer: "Bra som redan görs: [en rad eller ingen].",
    manualText: "",
    owner: "",
    evidence: "",
    simpleWays: "En rad eller ingen.",
    sourceText: "flik Sammanställning; pärm blankett 21.",
    optional: true,
  },
};

export function getQuestion(source: QuizSource) {
  return questions[source];
}

export function QuizFlow({ prompt, value, onChange, onSubmit, onSkip, onNotRelevant }: {
  prompt: QuizPrompt;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  onNotRelevant: () => void;
}) {
  const question = questions[prompt.source];
  const [isPureService, setIsPureService] = useState(false);
  const canSubmit = Boolean(value.trim());

  return (
    <Card className="border-primary/30 bg-primary/5" aria-labelledby="quiz-heading">
      <CardHeader className="gap-3">
        <Badge className="w-fit">{prompt.source === "MU-21-positive" ? "Frivillig uppgift" : `Fråga ${prompt.source}`}</Badge>
        <CardTitle id="quiz-heading" className="text-lg">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-muted-foreground">{question.explanation}</p>
        {prompt.context && <p className="rounded-lg bg-muted/50 p-3 text-sm"><strong>Rad:</strong> {prompt.context}</p>}
        {prompt.emptyEntry && <p className="rounded-lg bg-muted/50 p-3 text-sm">Om det stämmer att inga poster finns, skriv “{prompt.emptyEntry}” utan gap.</p>}
        <label className="flex flex-col gap-2 text-sm font-medium">Ert svar
          <Textarea value={value} onChange={event => onChange(event.target.value)} rows={3} placeholder="Skriv ert svar här" />
        </label>
        {question.notRelevantAllowed && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPureService} onChange={event => setIsPureService(event.target.checked)} className="size-4 accent-primary" />Livscykelkedjan saknas för raden (ren tjänst utan vara)</label>}
        <details className="rounded-lg border border-border bg-background">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Visa exempel, mall och underlag</summary>
          <div className="flex flex-col gap-3 border-t border-border p-4 text-sm leading-6">
            <p><strong>Exempel:</strong> {question.example}</p>
            <p><strong>Tips:</strong> {question.tip}</p>
            <p><strong>Mallsvar (hjälptext, inte ifyllt svar):</strong> {question.modelAnswer}</p>
            {question.manualText && <p><strong>Manualtext:</strong> {question.manualText}</p>}
            {question.owner && <p><strong>Vem:</strong> {question.owner}</p>}
            {question.evidence && <p><strong>Bevis:</strong> {question.evidence}</p>}
            <p><strong>Enkla sätt:</strong> {question.simpleWays}</p>
            <p><strong>Källa:</strong> {question.sourceText}</p>
          </div>
        </details>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onSubmit} disabled={!canSubmit}>Spara svar</Button>
          {question.notRelevantAllowed && isPureService && <Button type="button" variant="outline" onClick={onNotRelevant}>Markera inte relevant</Button>}
          {question.optional && <Button type="button" variant="ghost" onClick={onSkip}>Hoppa över utan gap</Button>}
        </div>
      </CardContent>
    </Card>
  );
}
