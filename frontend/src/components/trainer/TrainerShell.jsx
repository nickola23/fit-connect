import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, User, Dumbbell, LogOut } from "lucide-react";
import { clearSession } from "@/lib/auth-storage";

const tabs = [
  { to: "/trainer", label: "Početna", icon: Home, end: true },
  { to: "/trainer/profile", label: "Moj profil", icon: User, end: false },
  { to: "/trainer/exercises/new", label: "Nova vežba", icon: Dumbbell, end: false },
];

export function TrainerShell({ children }) {
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    navigate("/auth");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold">
              F
            </span>
            <span className="font-display text-lg font-bold text-foreground">
              FitConnect <span className="text-muted-foreground font-normal">/ Trener</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-foreground ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`
                }
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="hover:cursor-pointer ml-1 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Odjavi se</span>
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}