import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { login, ApiError } from "@/lib/api-client";
import { saveSession } from "@/lib/auth-storage";

export default function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const { token, user } = await login({ email, password });
      saveSession({ token, user });
      toast.success(`Dobrodošao/la, ${user.name}!`);
      if(user.role === "Trainer"){
        navigate("/trainer");
      }
      else if(user.role === "Client"){
        navigate("/client");
      }
      else{
        navigate("/admin");
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        toast.error("Pogrešan email ili lozinka");
      } else {
        toast.error("Prijava nije uspela", { description: error.message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Prijavi se
        </h1>
        <p className="mt-2 text-muted-foreground">
          Unesi podatke da pristupiš svom FitConnect nalogu.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none text-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="npr. marko@fitconnect.rs"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none text-foreground"
              >
                Lozinka
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Prijavljivanje..." : "Prijavi se"}
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Nemaš nalog?
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Button variant="outline" asChild>
              <Link to="/registration/trainer">Registruj se kao trener</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/registration/client">Registruj se kao klijent</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}