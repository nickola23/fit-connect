import { motion } from "framer-motion";
import { Star, MapPin, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import trainer1 from "@/assets/trainer-1.jpg";
import trainer2 from "@/assets/trainer-2.jpg";
import trainer3 from "@/assets/trainer-3.jpg";

const trainers = [
  {
    name: "Marko Petrović",
    image: trainer1,
    specialty: "Snaga i kondicija",
    location: "Beograd",
    rating: 4.9,
    reviews: 124,
    price: "4.500 RSD/mes",
    badges: ["NSCA", "CrossFit Level 2"],
  },
  {
    name: "Ana Jovanović",
    image: trainer2,
    specialty: "Yoga i mobilnost",
    location: "Novi Sad",
    rating: 4.8,
    reviews: 98,
    price: "3.900 RSD/mes",
    badges: ["RYT-500", "FMS"],
  },
  {
    name: "Nenad Stanković",
    image: trainer3,
    specialty: "Ishrana i transformacija",
    location: "Beograd",
    rating: 5.0,
    reviews: 156,
    price: "5.200 RSD/mes",
    badges: ["ISSA", "Pre/post natal"],
  },
];

export function TrainerShowcase() {
  return (
    <section id="trainers" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Istraži naše trenerE
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Svi treneri prolaze verifikaciju pre nego što im dozvolimo rad na platformi.
            </p>
          </div>
          <Button variant="outline" className="self-start sm:self-auto" asChild>
            <Link to="/trainers">Vidi sve trenera</Link>
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer, index) => (
            <motion.div
              key={trainer.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={trainer.image}
                  alt={`${trainer.name} — ${trainer.specialty}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  width={512}
                  height={512}
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-semibold text-foreground">
                  <Star className="h-3.5 w-3.5 fill-lime text-lime" />
                  {trainer.rating}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{trainer.name}</h3>
                    <p className="text-sm text-muted-foreground">{trainer.specialty}</p>
                  </div>
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {trainer.location}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {trainer.badges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-display text-lg font-semibold text-foreground">{trainer.price}</span>
                  <Button size="sm" asChild>
                    <Link to="/auth">Zakaži</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
