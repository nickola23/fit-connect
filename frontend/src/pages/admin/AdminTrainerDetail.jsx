import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getTrainerById,
  listTrainerCredentials,
  approveTrainer,
  rejectTrainer,
  ApiError,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, FileText, Mail, GraduationCap, BookOpen } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

const CREDENTIAL_TYPE_LABELS = {
  License: "Licenca",
  Diploma: "Diploma",
  CourseCertificate: "Sertifikat kursa",
};

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground break-words whitespace-pre-wrap">{value || "—"}</p>
      </div>
    </div>
  );
}

export default function AdminTrainerDetail() {
  usePageTitle("Zahtev za registraciju | FitConnect");

  const { id } = useParams();
  const navigate = useNavigate();

  const [trainer, setTrainer] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([getTrainerById(id), listTrainerCredentials(id)])
      .then(([trainerData, credentialsData]) => {
        if (cancelled) return;
        setTrainer(trainerData);
        setCredentials(credentialsData);
      })
      .catch((error) => {
        if (cancelled) return;
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam podatke o treneru.";
        toast.error("Greška pri učitavanju", { description: message });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleApprove() {
    setSubmitting(true);
    try {
      await approveTrainer(id);
      toast.success("Trener je odobren");
      navigate("/admin");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Greška pri odobravanju.";
      toast.error("Greška", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    setSubmitting(true);
    try {
      await rejectTrainer(id);
      toast.success("Trener je odbijen");
      navigate("/admin");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Greška pri odbijanju.";
      toast.error("Greška", { description: message });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !trainer) {
    return (
      <AdminShell>
        <p className="text-muted-foreground">Učitavanje…</p>
      </AdminShell>
    );
  }

  const isPending = trainer.registrationStatus === "Pending";

  return (
    <AdminShell>
      <Toaster />
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Nazad na početnu
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{trainer.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Zahtev za registraciju trenera.</p>
        </div>
        <Badge variant={isPending ? "outline" : "secondary"}>{trainer.registrationStatus}</Badge>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Podaci trenera</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <Row icon={Mail} label="Email" value={trainer.email} />
            <Row icon={GraduationCap} label="Obrazovanje" value={trainer.education} />
            <Row icon={BookOpen} label="Biografija" value={trainer.bio} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            {credentials.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema priloženih dokumenata.</p>
            ) : (
              <ul className="space-y-3">
                {credentials.map((c) => (
                  <li key={c.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">
                        {CREDENTIAL_TYPE_LABELS[c.type] || c.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{c.uploadDate}</span>
                    </div>
                    {c.issuedBy && (
                      <p className="mt-1.5 text-xs text-muted-foreground">Izdao: {c.issuedBy}</p>
                    )}
                    <a
                      href={c.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" /> Pogledaj dokument
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {isPending && (
        <div className="mt-6 flex items-center gap-3 border-t border-border pt-6">
          <Button onClick={handleApprove} disabled={submitting}>
            <Check className="mr-2 h-4 w-4" /> Prihvati
          </Button>
          <Button variant="outline" onClick={handleReject} disabled={submitting}>
            <X className="mr-2 h-4 w-4" /> Odbij
          </Button>
        </div>
      )}
    </AdminShell>
  );
}