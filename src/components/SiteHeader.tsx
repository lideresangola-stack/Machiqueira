import { Link, useNavigate } from "@tanstack/react-router";
import { Activity, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { user, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = roles.includes("admin");
  const isDoctor = roles.includes("doctor");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero shadow-glow transition-transform group-hover:scale-105">
            <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold text-foreground">SISCON</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Maxiqueira</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">Início</Link>
          {user && <Link to="/dashboard" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">Painel</Link>}
          {user && <Link to="/book" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">Agendar</Link>}
          {user && <Link to="/appointments" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">Consultas</Link>}
          {isDoctor && <Link to="/doctor" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">Agenda</Link>}
          {isAdmin && <Link to="/admin" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">Admin</Link>}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
              <LogOut className="h-4 w-4 mr-1.5" /> Sair
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/login">Entrar</Link></Button>
              <Button size="sm" className="bg-gradient-hero shadow-soft" asChild><Link to="/signup">Criar conta</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
