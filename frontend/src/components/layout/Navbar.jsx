import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold">
            F
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            FitConnect
          </span>
        </Link>

        <Button variant="outline" className="shrink-0" asChild>
          <Link to="/auth">Uloguj se</Link>
        </Button>
      </div>
    </header>
  );
}