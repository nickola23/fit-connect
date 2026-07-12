import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { registerTrainer, ApiError } from "@/lib/api-client";
import { saveSession } from "@/lib/auth-storage";

const CREDENTIAL_TYPES = [
  { value: "License", label: "Licenca" },
  { value: "Diploma", label: "Diploma" },
];

const schema = z.object({
  name: z.string().trim().min(2, "Ime i prezime mora imati bar 2 karaktera").max(120),
  email: z.string().trim().email("Unesi validnu email adresu").max(255),
  password: z
    .string()
    .min(8, "Lozinka mora imati bar 8 karaktera")
    .max(72)
    .regex(/[A-Z]/, "Lozinka mora sadržati bar jedno veliko slovo")
    .regex(/[0-9]/, "Lozinka mora sadržati bar jednu cifru"),
  confirmPassword: z.string(),
  education: z.string().trim().min(2, "Unesi školovanje").max(500),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  credentialType: z.enum(["License", "Diploma"]),
  credentialFileUrl: z.string().trim().url("Unesi validan URL").max(2048),
  credentialIssuedBy: z.string().trim().min(2, "Unesi ko je izdao licencu/diplomu").max(200),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Lozinke se ne poklapaju",
  path: ["confirmPassword"],
});

export default function RegisterTrainer() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [credentialType, setCredentialType] = useState("License");

  function handleSubmit(event) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);

    const raw = {
      name: fd.get("name"),
      email: fd.get("email"),
      password: fd.get("password"),
      confirmPassword: fd.get("confirmPassword"),
      education: fd.get("education"),
      bio: fd.get("bio") ?? "",
      credentialType,
      credentialFileUrl: fd.get("credentialFileUrl"),
      credentialIssuedBy: fd.get("credentialIssuedBy"),
    };

    const result = schema.safeParse(raw);
    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? "_";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Proveri unete podatke");
      return;
    }

    setErrors({});
    submitRegistration(result.data);
  }

  async function submitRegistration(data) {
    setSubmitting(true);
    try {
      const { token, user } = await registerTrainer({
        name: data.name,
        email: data.email,
        password: data.password,
        education: data.education,
        bio: data.bio || undefined,
        credentials: [
          {
            type: data.credentialType,
            fileUrl: data.credentialFileUrl,
            issuedBy: data.credentialIssuedBy,
          },
        ],
      });
      saveSession({ token, user });
      toast.success("Zahtev za registraciju je poslat!", {
        description: "Nalog čeka odobrenje administratora.",
      });
      navigate("/trainer");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error("Email je već registrovan");
      } else if (error instanceof ApiError && error.status === 400) {
        toast.error("Neispravni podaci o licenci/diplomi", { description: error.message });
      } else {
        toast.error("Registracija nije uspela", { description: error.message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Toaster />
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Registracija — trener
        </h1>
        <p className="mt-2 text-muted-foreground">
          Popuni svoje podatke. Admin tim proverava školovanje i licencu/diplomu pre
          odobravanja naloga.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">
                Ime i prezime <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Marko Petrović"
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="marko@fitconnect.rs"
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div />
              <div className="space-y-2">
                <Label htmlFor="password">
                  Lozinka <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Potvrdi lozinku <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">
                Školovanje <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="education"
                name="education"
                placeholder="npr. Fakultet sporta i fizičkog vaspitanja — diplomirani profesor fizičkog vaspitanja"
                aria-invalid={!!errors.education}
              />
              {errors.education && (
                <p className="text-xs text-destructive">{errors.education}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografija (opciono)</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="npr. 5 godina iskustva u treniranju snage."
                aria-invalid={!!errors.bio}
              />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
            </div>

            <div className="space-y-4 rounded-xl border border-border p-4">
              <p className="text-sm font-medium text-foreground">
                Licenca ili diploma <span className="text-destructive">*</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Potreban je link ka fajlu (uploadovanje na cloud dolazi kasnije — za sada
                samo nalepi URL).
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tip</Label>
                  <Select value={credentialType} onValueChange={setCredentialType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CREDENTIAL_TYPES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credentialIssuedBy">Izdao</Label>
                  <Input
                    id="credentialIssuedBy"
                    name="credentialIssuedBy"
                    type="text"
                    placeholder="npr. National Fitness Board"
                    aria-invalid={!!errors.credentialIssuedBy}
                  />
                  {errors.credentialIssuedBy && (
                    <p className="text-xs text-destructive">{errors.credentialIssuedBy}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credentialFileUrl">URL fajla</Label>
                <Input
                  id="credentialFileUrl"
                  name="credentialFileUrl"
                  type="url"
                  placeholder="https://.../licenca.pdf"
                  aria-invalid={!!errors.credentialFileUrl}
                />
                {errors.credentialFileUrl && (
                  <p className="text-xs text-destructive">{errors.credentialFileUrl}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Šaljem zahtev..." : "Pošalji zahtev za registraciju"}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Već imaš nalog?{" "}
            <Link to="/auth" className="font-medium text-primary hover:underline">
              Prijavi se
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}