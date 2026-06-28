import { motion } from "framer-motion";
import { Users, ClipboardList, MessageCircle, CreditCard, ShieldCheck, Award, Video, BarChart3 } from "lucide-react";

const clientFeatures = [
  {
    icon: Users,
    title: "Odaberi sertifikovanog trenera",
    description: "Pregledaj profile, ocene, komentare i specijalizacije. Izaberi trenera koji odgovara tvojim ciljevima.",
  },
  {
    icon: ClipboardList,
    title: "Personalizovani plan vežbanja",
    description: "Trener bira vežbe, broj ponavljanja i opremu na osnovu tvog zdravlja, rekvizita i lokacije.",
  },
  {
    icon: MessageCircle,
    title: "Direktna komunikacija",
    description: "Interni chat sa trenerom. Dobijaj obaveštenja o prihvatanju, isteku članarine i novim treninzima.",
  },
  {
    icon: BarChart3,
    title: "Prati napredak",
    description: "Ažuriraj težinu, visinu i zdravstveno stanje. Pregledaj istoriju svih vežbi i plaćenih članarina.",
  },
];

const trainerFeatures = [
  {
    icon: ShieldCheck,
    title: "Verifikacija kvalifikacija",
    description: "Brza provera diploma i licenci od strane admin tima. Poverljiva platforma za ozbiljne trenere.",
  },
  {
    icon: Video,
    title: "Snimanje i kreiranje vežbi",
    description: "Baza vežbi sa rekvizitima i spravama. Snimi sopstvene demonstracije i prilagodi klijentima.",
  },
  {
    icon: Award,
    title: "Ocenjivanje i recenzije",
    description: "Trener ocenjuje klijente (vidljivo samo drugim trenerima), a klijenti ocenjuju trenere javno.",
  },
  {
    icon: CreditCard,
    title: "Fleksibilna naplata",
    description: "Podesi mesečnu cenu komunikacije na osnovu broja treninga. Plaćanje ide preko platforme.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-card/30 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Sve što ti treba na jednom mestu
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Platforma je napravljena da klijentima i trenerima uštedi vreme i pruži strukturu.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-2xl font-semibold text-foreground">Za klijente</h3>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {clientFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 font-display text-lg font-semibold text-foreground">{feature.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-2xl font-semibold text-foreground">Za trenere</h3>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {trainerFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime/20 text-lime-foreground">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 font-display text-lg font-semibold text-foreground">{feature.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
