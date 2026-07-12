import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { TrainerShell } from "@/components/trainer/TrainerShell";
import { getUser } from "@/lib/auth-storage";
import { getTrainerById, listTrainerCredentials, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Mail, Globe, GraduationCap, FileText } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

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

export default function TrainerProfile() {
  usePageTitle("Moj profil | FitConnect");

  const [trainer, setTrainer] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getUser();
    if (!user) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([getTrainerById(user.id), listTrainerCredentials(user.id)])
      .then(([trainerData, credentialsData]) => {
        if (cancelled) return;
        setTrainer(trainerData);
        setCredentials(credentialsData);
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

  if (loading || !trainer)
    return (
      <TrainerShell>
        <p className="text-muted-foreground">Učitavanje…</p>
      </TrainerShell>
    );

  return (
    <TrainerShell>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Moj profil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Podaci koji se šalju API-ju (register/trainer i PATCH /api/trainers/{"{id}"}).
          </p>
        </div>
        <Button asChild>
          <Link to="/trainer/profile/edit">
            <Pencil className="mr-2 h-4 w-4" /> Izmeni podatke
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Osnovni podaci</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <Row icon={Mail} label="Ime i prezime" value={trainer.name} />
            <Row icon={Mail} label="Email" value={trainer.email} />
            <Row icon={Globe} label="Jezik" value={trainer.language} />
            <Row icon={GraduationCap} label="Obrazovanje" value={trainer.education} />
            <Row icon={FileText} label="Bio" value={trainer.bio} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nalog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge>{trainer.registrationStatus}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Prosečna ocena:</span>
              <span className="font-medium">
                {trainer.averageRating != null ? trainer.averageRating.toFixed(1) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Broj recenzija:</span>
              <span className="font-medium">{trainer.reviewCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono text-xs">{trainer.id}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Kredencijali ({credentials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {credentials.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema unetih kredencijala.</p>
            ) : (
              <ul className="divide-y divide-border">
                {credentials.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-foreground">{c.type}</p>
                      <p className="text-xs text-muted-foreground">
                        Izdao: {c.issuedBy} • {c.uploadDate}
                      </p>
                    </div>
                    <a
                      href={c.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary underline"
                    >
                      Otvori
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </TrainerShell>
  );
}