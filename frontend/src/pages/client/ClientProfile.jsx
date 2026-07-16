import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ClientShell } from "@/components/client/ClientShell";
import { getUser } from "@/lib/auth-storage";
import { getClientById, listClientHealthRecords, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Mail, Target, MapPin, Weight, Ruler, HeartPulse, RotateCcw } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

const GOAL_OPTIONS = [
  { value: "Weight loss", label: "Mršavljenje" },
  { value: "Muscle gain", label: "Mišićna masa" },
  { value: "Strength", label: "Snaga" },
  { value: "Endurance", label: "Kondicija / izdržljivost" },
  { value: "Mobility", label: "Mobilnost i fleksibilnost" },
  { value: "Rehabilitation", label: "Rehabilitacija" },
  { value: "Nutrition", label: "Ishrana" },
  { value: "General health", label: "Opšte zdravlje" },
];

const TRAINING_LOCATIONS = [
  { value: "Gym", label: "Teretana" },
  { value: "Home", label: "Kuća" },
];

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function ClientProfile() {
  usePageTitle("Moj profil | FitConnect");

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [healthRecords, setHealthRecords] = useState([]);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  useEffect(() => {
    const user = getUser();
    if (!user) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([getClientById(user.id), listClientHealthRecords(user.id)])
      .then(([clientData, records]) => {
        if (cancelled) return;
        setClient(clientData);
        const sorted = [...records].sort((a, b) =>
          a.recordDate < b.recordDate ? 1 : -1
        );
        setHealthRecords(sorted);
      })
      .catch((error) => {
        if (cancelled) return;
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam profil.";
        toast.error("Greška pri učitavanju", { description: message });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !client)
    return (
      <ClientShell>
        <p className="text-muted-foreground">Učitavanje…</p>
      </ClientShell>
    );

  // Prevedi vrednost cilja na srpsku labelu
  const goalLabel = GOAL_OPTIONS.find((g) => g.value === client.goal)?.label || client.goal;

  // Prevedi lokaciju vežbanja
  const locationLabel = TRAINING_LOCATIONS.find((t) => t.value === client.trainingLocation)?.label || "Nije izabrano";

  // healthRecords je sortiran najnoviji->najstariji; timeline se prikazuje hronološki (najstariji levo)
  const timelineRecords = [...healthRecords].reverse();
  const currentRecord = healthRecords[0] || null;
  const displayedRecord = selectedRecordId
    ? healthRecords.find((r) => r.id === selectedRecordId) || currentRecord
    : currentRecord;
  const isViewingPast = !!selectedRecordId && selectedRecordId !== currentRecord?.id;

  return (
    <ClientShell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Moj profil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Podaci tvojeg klijentskog naloga na FitConnect platformi.
          </p>
        </div>
        <Button asChild>
          <Link to="/client/profile/edit">
            <Pencil className="mr-2 h-4 w-4" /> Izmeni podatke
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Osnovni i fitnes podaci</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <Row icon={Mail} label="Ime i prezime" value={client.name} />
            <Row icon={Mail} label="Email" value={client.email} />
            <Row icon={Target} label="Cilj" value={goalLabel} />
            <Row icon={MapPin} label="Način vežbanja" value={locationLabel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nalog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Uloga:</span>
              <span className="font-medium">Klijent</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono text-xs">{client.id}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Zdravstveni podaci kroz vreme</CardTitle>
            {isViewingPast && (
              <Button variant="outline" size="sm" onClick={() => setSelectedRecordId(null)}>
                <RotateCcw className="mr-2 h-3.5 w-3.5" /> Vrati se na trenutni
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {healthRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Još uvek nema unetih zdravstvenih podataka. Možeš ih dodati na stranici za izmenu profila.
              </p>
            ) : (
              <>
                <div className="mb-8 flex flex-wrap items-center">
                  {timelineRecords.map((record, index) => {
                    const isSelected = record.id === displayedRecord?.id;
                    const isLast = index === timelineRecords.length - 1;
                    return (
                      <div key={record.id} className="flex items-start">
                        <button
                          type="button"
                          onClick={() => setSelectedRecordId(record.id)}
                          className="flex flex-col items-center gap-2 px-3 py-1"
                          title={record.recordDate}
                        >
                          <span
                            className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-colors ${
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/40 bg-background hover:border-primary/60"
                            }`}
                          />
                          <span
                            className={`whitespace-nowrap text-xs ${
                              isSelected ? "font-medium text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {record.recordDate}
                          </span>
                        </button>
                        {!isLast && <div className="mt-[11px] h-0.5 w-8 shrink-0 bg-border sm:w-16" />}
                      </div>
                    );
                  })}
                </div>

                {displayedRecord && (
                  <div className="rounded-lg border border-border">
                    <div className="border-b border-border bg-muted/30 px-4 py-2">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {isViewingPast ? "Prikazan zapis od" : "Trenutni zapis od"} {displayedRecord.recordDate}
                      </p>
                    </div>
                    <div className="divide-y divide-border px-4">
                      <Row icon={Weight} label="Težina (kg)" value={displayedRecord.weight ?? "—"} />
                      <Row icon={Ruler} label="Visina (cm)" value={displayedRecord.height ?? "—"} />
                      <Row
                        icon={HeartPulse}
                        label="Zdravstveno stanje"
                        value={displayedRecord.healthCondition}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientShell>
  );
}