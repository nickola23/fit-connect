import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function Auth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    // TODO: povezati sa backendom kada API bude spreman
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
                htmlFor="username"
                className="text-sm font-medium leading-none text-foreground"
              >
                Korisničko ime
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="npr. marko123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              />
            </div>

            <Button type="submit" className="w-full">
              Prijavi se
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