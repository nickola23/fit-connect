import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <span className="font-display text-7xl font-bold text-primary">404</span>
      <h1 className="mt-4 font-display text-2xl font-semibold text-foreground sm:text-3xl">
        Stranica ne postoji
      </h1>
      <p className="mt-3 text-muted-foreground">
        Link koji si otvorio/la ne vodi nigde. Provera adrese ili povratak na početnu.
      </p>
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
