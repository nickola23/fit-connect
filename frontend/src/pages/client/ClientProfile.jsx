import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ClientShell } from "@/components/client/ClientShell";
import { getUser } from "@/lib/auth-storage";
import { getClientById, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Mail, Target, MapPin } from "lucide-react";
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

  useEffect(() => {
    const user = getUser();
    if (!user) return;

    let cancelled = false;
    setLoading(true);

    getClientById(user.id)
      .then((clientData) => {
        if (cancelled) return;
        setClient(clientData);
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
      </div>
    </ClientShell>
  );
}