import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "FitConnect mi je promenio rutinu. Imam trenera koji prati moje vežbe, a sve radim kod kuće bez rekvizita. Napredak je vidljiv posle mesec dana.",
    author: "Jelena M.",
    role: "Klijent",
    result: "-7 kg za 3 meseca",
  },
  {
    quote:
      "Kao trener, napokon imam alatku da organizujem klijente, pišem planove i komuniciram na jednom mestu. Plaćanja su jednostavna i transparentna.",
    author: "Stefan R.",
    role: "Trener",
    result: "30+ aktivnih klijenata",
  },
  {
    quote:
      "Sviđa mi se što mogu da biram trenera na osnovu stvarnih recenzija i da vidim kvalifikacije. Verifikacija daje dodatnu sigurnost.",
    author: "Maja K.",
    role: "Klijent",
    result: "Vežba 4x nedeljno",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-forest text-forest-foreground py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Šta kažu naši korisnici
          </h2>
          <p className="mt-4 text-lg text-forest-foreground/70">
            Priče klijenata i trenera koji su već deo FitConnect zajednice.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative rounded-2xl bg-forest-foreground/10 p-6 backdrop-blur-sm"
            >
              <Quote className="h-8 w-8 text-lime" />
              <p className="mt-4 text-lg leading-relaxed text-forest-foreground">{testimonial.quote}</p>
              <div className="mt-6 flex items-center justify-between border-t border-forest-foreground/20 pt-4">
                <div>
                  <p className="font-display font-semibold text-forest-foreground">{testimonial.author}</p>
                  <p className="text-sm text-forest-foreground/70">{testimonial.role}</p>
                </div>
                <span className="rounded-full bg-lime px-3 py-1 text-xs font-semibold text-lime-foreground">
                  {testimonial.result}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
