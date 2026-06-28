import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function ComingSoon({ title, description }) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
        Stranica u izradi
      </span>
      <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Nazad na početnu
      </Link>
    </section>
  );
}
