import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dumbbell } from "lucide-react";

export function CTADual() {
  return (
    <section className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Dumbbell className="h-6 w-6" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Spreman da kreneš sa treningom?
            </h3>
            <p className="mt-3 text-muted-foreground">
              Pronađi sertifikovanog trenera, zakaži besplatan uvodni trening i postavi ciljeve. Bez obaveze, bez
              skrivenih troškova.
            </p>
            <Button className="mt-8 gap-2" size="lg" asChild>
              <Link to="/auth">
                Pronađi trenera
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="rounded-3xl bg-forest p-8 text-forest-foreground sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime text-lime-foreground">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="mt-6 font-display text-2xl font-bold sm:text-3xl">Želiš da postaneš trener?</h3>
            <p className="mt-3 text-forest-foreground/70">
              Prijavi se sa diplomom ili licencom, prođi verifikaciju i počni da primaš klijente. Podesi sopstvenu
              cenu i raspored.
            </p>
            <Button className="mt-8 gap-2 bg-lime text-lime-foreground hover:bg-lime/90" size="lg" asChild>
              <Link to="/auth">
                Postani trener
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
