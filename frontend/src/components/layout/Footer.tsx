import { Link } from "react-router-dom";
import { Instagram, Twitter, Mail } from "lucide-react";

const footerLinks = {
  Platforma: [
    { label: "Kako radi", href: "#how-it-works" },
    { label: "Funkcije", href: "#features" },
    { label: "Treneri", href: "#trainers" },
    { label: "Cene", href: "#pricing" },
  ],
  Korisnici: [
    { label: "Za klijente", href: "/auth" },
    { label: "Za trenere", href: "/auth" },
    { label: "Prijavi se", href: "/auth" },
    { label: "Registruj se", href: "/auth" },
  ],
  Podrška: [
    { label: "Pomoć", href: "/help" },
    { label: "Uslovi korišćenja", href: "/terms" },
    { label: "Privatnost", href: "/privacy" },
    { label: "Kontakt", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold">
                F
              </span>
              <span className="font-display text-xl font-bold tracking-tight text-foreground">FitConnect</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Platforma koja povezuje klijente i sertifikovane online trenere. Personalizovani treninzi, praćenje
              napretka i direktna komunikacija.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display text-sm font-semibold text-foreground">{category}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FitConnect. Sva prava zadržana.
        </div>
      </div>
    </footer>
  );
}
