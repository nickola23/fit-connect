import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { TrainerShell } from "@/components/trainer/TrainerShell";
import { getUser } from "@/lib/auth-storage";
import { getTrainerById, updateTrainerById, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";
import { usePageTitle } from "@/lib/use-page-title";

const schema = z.object({
  name: z.string().trim().min(2, "Ime mora imati bar 2 karaktera").max(100),
  email: z.string().trim().email("Neispravan email").max(255),
  language: z.string().trim().min(2).max(5),
  education: z.string().trim().min(2, "Obavezno polje").max(200),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
});

export default function TrainerProfileEdit() {
  usePageTitle("Izmena profila | FitConnect");

  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [errors, setErrors] = useState({});
  const [language, setLanguage] = useState("sr");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) return;

    getTrainerById(user.id)
      .then((t) => {
        setTrainer(t);
        setLanguage(t.language);
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Ne mogu da učitam profil.";
        toast.error("Greška pri učitavanju", { description: message });
      });
  }, []);

  if (!trainer)
    return (
      <TrainerShell>
        <p className="text-muted-foreground">Učitavanje…</p>
      </TrainerShell>
    );

  function onSubmit(e) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      language,
      education: fd.get("education"),
      bio: fd.get("bio"),
    });
    if (!parsed.success) {
      const es = {};
      for (const issue of parsed.error.issues) es[issue.path.join(".")] = issue.message;
      setErrors(es);
      return;
    }

    setSubmitting(true);
    updateTrainerById(trainer.id, {
      name: parsed.data.name,
      email: parsed.data.email,
      language: parsed.data.language,
      education: parsed.data.education,
      bio: parsed.data.bio ?? "",
    })
      .then(() => {
        toast.success("Profil je sačuvan");
        navigate("/trainer/profile");
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Izmene nisu sačuvane.";
        toast.error("Greška", { description: message });
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <TrainerShell>
      <Toaster />
      <Link
        to="/trainer/profile"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Nazad na profil
      </Link>

      <Card className="mt-4 max-w-3xl">
        <CardHeader>
          <CardTitle>Izmeni podatke</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid gap-2.5">
              <Label htmlFor="name">Ime i prezime *</Label>
              <Input id="name" name="name" defaultValue={trainer.name} maxLength={100} required />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" defaultValue={trainer.email} maxLength={255} required />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="language">Jezik *</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sr">Srpski (sr)</SelectItem>
                  <SelectItem value="en">English (en)</SelectItem>
                </SelectContent>
              </Select>
              {errors.language && <p className="text-xs text-destructive">{errors.language}</p>}
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="education">Obrazovanje *</Label>
              <Input
                id="education"
                name="education"
                defaultValue={trainer.education}
                maxLength={200}
                required
              />
              {errors.education && <p className="text-xs text-destructive">{errors.education}</p>}
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={trainer.bio} rows={5} maxLength={1000} />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
            </div>

            <div className="flex items-center gap-3 border-t border-border pt-6">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Čuvam..." : "Sačuvaj izmene"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/trainer/profile")}>
                Otkaži
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </TrainerShell>
  );
}