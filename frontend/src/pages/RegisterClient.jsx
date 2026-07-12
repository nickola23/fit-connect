import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { registerClient, ApiError } from "@/lib/api-client";
import { saveSession } from "@/lib/auth-storage";

// Helper za postavljanje <title> i meta tagova (zamena za TanStack-ov head()).
function usePageMeta({ title, description, robots }) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const metaTags = [];

    const upsertMeta = (name, content) => {
      if (!content) return;
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
        metaTags.push(tag);
      }
      tag.setAttribute("content", content);
    };

    upsertMeta("description", description);
    upsertMeta("robots", robots);

    return () => {
      document.title = prevTitle;
      metaTags.forEach((tag) => tag.remove());
    };
  }, [title, description, robots]);
}

// Vrednosti su proizvoljne, backend "goal" polje prima slobodan string (npr. "Weight loss").
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

const schema = z
  .object({
    name: z.string().trim().min(2, "Ime i prezime mora imati bar 2 karaktera").max(120),
    email: z.string().trim().email("Unesi validnu email adresu").max(255),
    password: z
      .string()
      .min(8, "Lozinka mora imati bar 8 karaktera")
      .max(72)
      .regex(/[A-Z]/, "Lozinka mora sadržati bar jedno veliko slovo")
      .regex(/[0-9]/, "Lozinka mora sadržati bar jednu cifru"),
    confirmPassword: z.string(),
    goal: z.string().min(1, "Izaberi cilj"),
    trainingLocation: z.string().optional().or(z.literal("")),
    acceptTerms: z.literal(true, {
      message: "Moraš prihvatiti uslove korišćenja",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Lozinke se ne poklapaju",
    path: ["confirmPassword"],
  });

export function RegisterClient() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [goal, setGoal] = useState("");
  const [trainingLocation, setTrainingLocation] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  usePageMeta({
    title: "Registracija klijenta — FitConnect",
    description:
      "Napravi nalog klijenta na FitConnect platformi — unesi osnovne podatke i cilj da bismo te povezali sa pravim trenerom.",
    robots: "noindex",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const raw = {
      name: fd.get("name"),
      email: fd.get("email"),
      password: fd.get("password"),
      confirmPassword: fd.get("confirmPassword"),
      goal,
      trainingLocation,
      acceptTerms,
    };

    const result = schema.safeParse(raw);
    if (!result.success) {
      const fieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? "_";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Proveri unete podatke", {
        description: "Neka polja nisu validna.",
      });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const { token, user } = await registerClient({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
        goal: result.data.goal,
        trainingLocation: result.data.trainingLocation || undefined,
      });
      saveSession({ token, user });
      toast.success("Nalog je uspešno kreiran!");
      navigate("/");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error("Email je već registrovan");
      } else {
        toast.error("Registracija nije uspela", { description: error.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Nazad na početnu
        </Link>

        <div className="mt-6 mb-10">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Registracija klijenta
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Napravi svoj FitConnect nalog
          </h1>
          <p className="mt-2 text-muted-foreground">
            Reci nam nešto o sebi kako bismo te povezali sa pravim trenerom.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
          <FormSection
            title="Pristupni podaci"
            description="Koristićeš ih za prijavu."
          >
            <div className="sm:col-span-2">
              <Field
                label="Ime i prezime"
                name="name"
                error={errors.name}
                required
                autoComplete="name"
              />
            </div>
            <Field
              label="Email"
              name="email"
              type="email"
              error={errors.email}
              required
              autoComplete="email"
            />
            <div />
            <Field
              label="Lozinka"
              name="password"
              type="password"
              error={errors.password}
              required
              autoComplete="new-password"
              hint="Najmanje 8 karaktera, jedno veliko slovo i jedna cifra."
            />
            <Field
              label="Potvrdi lozinku"
              name="confirmPassword"
              type="password"
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />
          </FormSection>

          <FormSection
            title="Tvoji ciljevi"
            description="Pomaže treneru da kreira plan po meri."
          >
            <div className="space-y-2">
              <Label>
                Cilj <span className="text-destructive">*</span>
              </Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger aria-invalid={!!errors.goal}>
                  <SelectValue placeholder="Izaberi cilj" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_OPTIONS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.goal && (
                <p className="text-xs text-destructive">{errors.goal}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Način vežbanja (opciono)</Label>
              <Select value={trainingLocation} onValueChange={setTrainingLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberi" />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_LOCATIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormSection>

          <div className="space-y-6 border-t border-border pt-8">
            <div className="flex items-start gap-3">
              <Checkbox
                id="acceptTerms"
                checked={acceptTerms}
                onCheckedChange={(v) => setAcceptTerms(v === true)}
                aria-invalid={!!errors.acceptTerms}
              />
              <div className="space-y-1">
                <Label htmlFor="acceptTerms" className="cursor-pointer leading-snug">
                  Prihvatam{" "}
                  <a href="#" className="text-primary underline">
                    uslove korišćenja
                  </a>{" "}
                  i{" "}
                  <a href="#" className="text-primary underline">
                    politiku privatnosti
                  </a>
                  .
                </Label>
                {errors.acceptTerms && (
                  <p className="text-xs text-destructive">{errors.acceptTerms}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center">
              <p className="text-sm text-muted-foreground">
                Već imaš nalog?{" "}
                <Link to="/auth" className="text-primary font-medium hover:underline">
                  Uloguj se
                </Link>
              </p>
              <Button type="submit" size="lg" disabled={submitting} className="sm:min-w-[200px]">
                {submitting ? "Kreiram nalog..." : "Kreiraj nalog"}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function FormSection({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, name, error, hint, required, type = "text", ...rest }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input id={name} name={name} type={type} aria-invalid={!!error} {...rest} />
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}