import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Calendar, ClipboardList, Plus, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Painel — SISCON" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ upcoming: 0, total: 0 });
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: appts } = await supabase
        .from("appointments")
        .select("id, scheduled_at, status")
        .eq("patient_id", user.id);
      const now = new Date();
      const upcoming = (appts ?? []).filter((a: any) => new Date(a.scheduled_at) >= now && a.status !== "cancelled").length;
      setStats({ upcoming, total: (appts ?? []).length });

      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
      setProfileName(p?.full_name || user.email?.split("@")[0] || "");
    })();
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Bem-vindo de volta</p>
          <h1 className="font-display text-3xl font-bold">{profileName}</h1>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard icon={Calendar} label="Próximas consultas" value={stats.upcoming} />
          <StatCard icon={ClipboardList} label="Total de consultas" value={stats.total} />
          <StatCard icon={Stethoscope} label="Perfil" value={roles.includes("admin") ? "Administrador" : roles.includes("doctor") ? "Médico" : "Paciente"} small />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ActionCard
            title="Agendar nova consulta"
            desc="Escolha especialidade, médico e horário."
            cta="Agendar"
            href="/book"
            primary
          />
          <ActionCard
            title="As minhas consultas"
            desc="Ver, remarcar ou cancelar consultas."
            cta="Ver histórico"
            href="/appointments"
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, small }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className={small ? "text-lg font-semibold" : "text-3xl font-bold font-display"}>{value}</div>
    </div>
  );
}

function ActionCard({ title, desc, cta, href, primary }: any) {
  return (
    <div className={`rounded-2xl p-6 border ${primary ? "bg-gradient-hero text-primary-foreground border-transparent shadow-elevated" : "bg-card border-border shadow-soft"}`}>
      <h3 className="font-display text-xl font-semibold mb-1">{title}</h3>
      <p className={`text-sm mb-4 ${primary ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{desc}</p>
      <Button variant={primary ? "secondary" : "default"} asChild>
        <Link to={href}><Plus className="h-4 w-4 mr-1.5" />{cta}</Link>
      </Button>
    </div>
  );
}
