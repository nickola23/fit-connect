import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { TrainerShell } from "@/components/trainer/TrainerShell";
import { getUser } from "@/lib/auth-storage";
import {
  getTrainerById,
  listTrainerCredentials,
  addTrainerCredential,
  deleteTrainerCredential,
  uploadFile,
  resolveFileUrl,
  ApiError,
} from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Mail, Globe, GraduationCap, FileText, Plus, Trash2, Loader2 } from "lucide-react";
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newType, setNewType] = useState("License");
  const [newIssuedBy, setNewIssuedBy] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  function resetForm() {
    setNewType("License");
    setNewIssuedBy("");
    setNewFile(null);
  }

  async function handleAddCredential(e) {
    e.preventDefault();
    if (!trainer) return;
    if (!newFile) {
      toast.error("Izaberite fajl", { description: "Morate priložiti dokument (PDF/slika)." });
      return;
    }

    setSaving(true);
    try {
      const { url } = await uploadFile(newFile, "Credentials");
      const created = await addTrainerCredential(trainer.id, {
        type: newType,
        fileUrl: url,
        issuedBy: newIssuedBy || undefined,
      });
      setCredentials((prev) => [...prev, created]);
      toast.success("Kredencijal je dodat");
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Dodavanje kredencijala nije uspelo.";
      toast.error("Greška", { description: message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCredential(credentialId) {
    if (!trainer) return;
    setDeletingId(credentialId);
    try {
      await deleteTrainerCredential(trainer.id, credentialId);
      setCredentials((prev) => prev.filter((c) => c.id !== credentialId));
      toast.success("Kredencijal je obrisan");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Brisanje kredencijala nije uspelo.";
      toast.error("Greška", { description: message });
    } finally {
      setDeletingId(null);
    }
  }

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
        <Toaster />
        <p className="text-muted-foreground">Učitavanje…</p>
      </TrainerShell>
    );

  return (
    <TrainerShell>
      <Toaster />
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Kredencijali ({credentials.length})</CardTitle>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Dodaj kredencijal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novi kredencijal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddCredential} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="credential-type">Tip</Label>
                    <Select value={newType} onValueChange={setNewType}>
                      <SelectTrigger id="credential-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="License">Licenca</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="CourseCertificate">Sertifikat kursa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credential-issuedBy">Izdao (opciono)</Label>
                    <Input
                      id="credential-issuedBy"
                      value={newIssuedBy}
                      onChange={(e) => setNewIssuedBy(e.target.value)}
                      placeholder="npr. National Fitness Board"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credential-file">Dokument (PDF ili slika)</Label>
                    <Input
                      id="credential-file"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Čuvanje…
                        </>
                      ) : (
                        "Sačuvaj"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {credentials.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema unetih kredencijala.</p>
            ) : (
              <ul className="divide-y divide-border">
                {credentials.map((c) => (
                  <li key={c.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {CREDENTIAL_TYPE_LABELS[c.type] || c.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Izdao: {c.issuedBy || "—"} • {c.uploadDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={resolveFileUrl(c.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary underline"
                      >
                        Otvori
                      </a>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={deletingId === c.id}
                        onClick={() => handleDeleteCredential(c.id)}
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
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