import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Check } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";

// Helper za postavljanje <title> i meta tagova (zamena za TanStack-ov head()).
// Ako koristiš react-helmet-async ili nešto slično, slobodno zameni ovo njime.
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

const GOAL_OPTIONS = [
  { id: "weight_loss", label: "Mršavljenje" },
  { id: "muscle_gain", label: "Mišićna masa" },
  { id: "strength", label: "Snaga" },
  { id: "endurance", label: "Kondicija / izdržljivost" },
  { id: "mobility", label: "Mobilnost i fleksibilnost" },
  { id: "rehab", label: "Rehabilitacija" },
  { id: "nutrition", label: "Ishrana" },
  { id: "general_health", label: "Opšte zdravlje" },
];

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedeći način života" },
  { value: "light", label: "Lagano aktivan (1–2x nedeljno)" },
  { value: "moderate", label: "Umereno aktivan (3–4x nedeljno)" },
  { value: "active", label: "Veoma aktivan (5+ nedeljno)" },
  { value: "athlete", label: "Sportista / profesionalac" },
];

const schema = z
  .object({
    firstName: z.string().trim().min(2, "Ime mora imati bar 2 karaktera").max(50),
    lastName: z.string().trim().min(2, "Prezime mora imati bar 2 karaktera").max(50),
    username: z
      .string()
      .trim()
      .min(3, "Korisničko ime mora imati bar 3 karaktera")
      .max(30)
      .regex(/^[a-zA-Z0-9_.-]+$/, "Dozvoljena su slova, brojevi i . _ -"),
    email: z.string().trim().email("Unesi validnu email adresu").max(255),
    password: z
      .string()
      .min(8, "Lozinka mora imati bar 8 karaktera")
      .max(72)
      .regex(/[A-Z]/, "Lozinka mora sadržati bar jedno veliko slovo")
      .regex(/[0-9]/, "Lozinka mora sadržati bar jednu cifru"),
    confirmPassword: z.string(),
    phone: z
      .string()
      .trim()
      .min(6, "Unesi validan broj telefona")
      .max(20)
      .regex(/^[+0-9\s()-]+$/, "Dozvoljeni su brojevi i + ( ) - razmaci"),
    address: z.string().trim().min(3, "Unesi adresu").max(120),
    city: z.string().trim().min(2, "Unesi grad").max(60),
    dateOfBirth: z.string().min(1, "Unesi datum rođenja"),
    gender: z.enum(["male", "female", "other"], {
      message: "Izaberi pol",
    }),
    heightCm: z.coerce
      .number({ message: "Unesi visinu" })
      .min(100, "Visina mora biti bar 100 cm")
      .max(250, "Visina ne može biti veća od 250 cm"),
    weightKg: z.coerce
      .number({ message: "Unesi težinu" })
      .min(30, "Težina mora biti bar 30 kg")
      .max(300, "Težina ne može biti veća od 300 kg"),
    activityLevel: z.string().min(1, "Izaberi nivo aktivnosti"),
    goals: z.array(z.string()).min(1, "Izaberi bar jedan cilj"),
    medicalNotes: z.string().max(1000).optional().or(z.literal("")),
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
  const [goals, setGoals] = useState([]);
  const [gender, setGender] = useState("");
  const [activity, setActivity] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  usePageMeta({
    title: "Registracija klijenta — FitConnect",
    description:
      "Napravi nalog klijenta na FitConnect platformi — unesi osnovne podatke, ciljeve i trenutno stanje da bismo te povezali sa pravim trenerom.",
    robots: "noindex",
  });

  const toggleGoal = (id) => {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    const raw = {
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      username: fd.get("username"),
      email: fd.get("email"),
      password: fd.get("password"),
      confirmPassword: fd.get("confirmPassword"),
      phone: fd.get("phone"),
      address: fd.get("address"),
      city: fd.get("city"),
      dateOfBirth: fd.get("dateOfBirth"),
      gender,
      heightCm: fd.get("heightCm"),
      weightKg: fd.get("weightKg"),
      activityLevel: activity,
      goals,
      medicalNotes: fd.get("medicalNotes") ?? "",
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
      setSubmitting(false);
      toast.error("Proveri unete podatke", {
        description: "Neka polja nisu validna.",
      });
      return;
    }

    setErrors({});
    // Mock API call
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Nalog je uspešno kreiran!", {
        description: "Ovo je mock — backend će biti povezan kasnije.",
      });
      console.log("[MOCK REGISTER PAYLOAD]", result.data);
      navigate("/");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      
      <Toaster />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
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
          {/* Personal info */}
          <FormSection
            title="Lični podaci"
            description="Osnovne informacije o tebi."
          >
            <Field
              label="Ime"
              name="firstName"
              error={errors.firstName}
              required
              autoComplete="given-name"
            />
            <Field
              label="Prezime"
              name="lastName"
              error={errors.lastName}
              required
              autoComplete="family-name"
            />
            <Field
              label="Datum rođenja"
              name="dateOfBirth"
              type="date"
              error={errors.dateOfBirth}
              required
            />
            <div className="space-y-2">
              <Label>
                Pol <span className="text-destructive">*</span>
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger aria-invalid={!!errors.gender}>
                  <SelectValue placeholder="Izaberi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Muški</SelectItem>
                  <SelectItem value="female">Ženski</SelectItem>
                  <SelectItem value="other">Drugo / Ne želim da kažem</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-xs text-destructive">{errors.gender}</p>
              )}
            </div>
          </FormSection>

          {/* Account */}
          <FormSection
            title="Pristupni podaci"
            description="Koristićeš ih za prijavu."
          >
            <Field
              label="Korisničko ime"
              name="username"
              error={errors.username}
              required
              autoComplete="username"
            />
            <Field
              label="Email"
              name="email"
              type="email"
              error={errors.email}
              required
              autoComplete="email"
            />
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

          {/* Contact */}
          <FormSection
            title="Kontakt i adresa"
            description="Kako da te treneri kontaktiraju."
          >
            <Field
              label="Broj telefona"
              name="phone"
              type="tel"
              error={errors.phone}
              required
              autoComplete="tel"
              placeholder="+381 ..."
            />
            <Field
              label="Grad"
              name="city"
              error={errors.city}
              required
              autoComplete="address-level2"
            />
            <div className="sm:col-span-2">
              <Field
                label="Adresa"
                name="address"
                error={errors.address}
                required
                autoComplete="street-address"
              />
            </div>
          </FormSection>

          {/* Body stats */}
          <FormSection
            title="Trenutno stanje"
            description="Pomaže treneru da kreira plan po meri."
          >
            <Field
              label="Visina (cm)"
              name="heightCm"
              type="number"
              inputMode="numeric"
              error={errors.heightCm}
              required
              placeholder="npr. 178"
            />
            <Field
              label="Težina (kg)"
              name="weightKg"
              type="number"
              inputMode="numeric"
              error={errors.weightKg}
              required
              placeholder="npr. 75"
            />
            <div className="sm:col-span-2 space-y-2">
              <Label>
                Nivo aktivnosti <span className="text-destructive">*</span>
              </Label>
              <Select value={activity} onValueChange={setActivity}>
                <SelectTrigger aria-invalid={!!errors.activityLevel}>
                  <SelectValue placeholder="Izaberi nivo" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_LEVELS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.activityLevel && (
                <p className="text-xs text-destructive">{errors.activityLevel}</p>
              )}
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="medicalNotes">
                Zdravstvene napomene (opciono)
              </Label>
              <Textarea
                id="medicalNotes"
                name="medicalNotes"
                placeholder="Povrede, hronična stanja, ograničenja..."
                rows={3}
              />
              {errors.medicalNotes && (
                <p className="text-xs text-destructive">{errors.medicalNotes}</p>
              )}
            </div>
          </FormSection>

          {/* Goals */}
          <FormSection
            title="Tvoji ciljevi"
            description="Izaberi jedan ili više ciljeva."
            singleColumn
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {GOAL_OPTIONS.map((goal) => {
                const active = goals.includes(goal.id);
                return (
                  <button
                    type="button"
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }`}
                    aria-pressed={active}
                  >
                    {goal.label}
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
            {errors.goals && (
              <p className="text-xs text-destructive">{errors.goals}</p>
            )}
          </FormSection>

          {/* Terms + submit */}
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

function FormSection({ title, description, children, singleColumn }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div
        className={
          singleColumn
            ? "space-y-4"
            : "grid grid-cols-1 gap-4 sm:grid-cols-2"
        }
      >
        {children}
      </div>
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