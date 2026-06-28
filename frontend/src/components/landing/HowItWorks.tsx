import { motion } from "framer-motion";
import { Search, Calendar, TrendingUp, UserCheck, Dumbbell, MessageSquare } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Pronađi trenera",
    description: "Filtriraj po specializaciji, oceni i ceni. Pogledaj profile i recenzije drugih klijenata.",
  },
  {
    icon: Calendar,
    title: "Zakaži i dogovori se",
    description: "Pošalji zahtev treneru. Nakon prihvatanja, zajedno odredite ciljeve, raspored i način vežbanja.",
  },
  {
    icon: TrendingUp,
    title: "Vežbaj i prati napredak",
    description: "Dobij personalizovane treninge, označavaj urađene vežbe i komuniciraj sa trenerom u aplikaciji.",
  },
];

const trainerSteps = [
  {
    icon: UserCheck,
    title: "Registruj se i verifikuj",
    description: "Pošalji zahtev sa diplomom ili licencom. Admin tim brzo proveri tvoje kvalifikacije.",
  },
  {
    icon: Dumbbell,
    title: "Kreiraj treninge",
    description: "Biraj vežbe iz baze, prilagođavaj broj ponavljanja i šalji klijentima planove sa datumom.",
  },
  {
    icon: MessageSquare,
    title: "Rasti sa klijentima",
    description: "Komuniciraj, ocenjuj napredak i primaj redovna plaćanja — sve preko FitConnect platforme.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Kako radi FitConnect?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Dva jasna toka: ti tražiš trenera ili postaješ trener i gradiš klijentelu.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Za klijente</h3>
            <div className="mt-8 space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold text-foreground">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-1 text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:pl-12 lg:border-l lg:border-border">
            <h3 className="font-display text-xl font-semibold text-foreground">Za trenere</h3>
            <div className="mt-8 space-y-8">
              {trainerSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime text-lime-foreground">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold text-foreground">
                      {index + 1}. {step.title}
                    </p>
                    <p className="mt-1 text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
