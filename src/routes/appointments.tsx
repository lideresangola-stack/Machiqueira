import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Stethoscope, X } from "lucide-react";

export const Route = createFileRoute("/appointments")({
  head: () => ({ meta: [{ title: "As minhas consultas — SISCON" }] }),
  component: AppointmentsPage,
});

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pendente", cls: "bg-warning/15 text-warning-foreground border-warning/40" },
  confirmed: { label: "Confirmada", cls: "bg-success/15 text-success border-success/40" },
  cancelled: { label: "Cancelada", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  completed: { label: "Concluída", cls: "bg-muted text-muted-foreground border-border" },
};

function AppointmentsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  async function load() {
    if (!user) return;
    const { data } = await supabase
      .from("appointments")
      .select("id, scheduled_at, status, reason, doctors(full_name), specialties(name)")
      .eq("patient_id", user.id)
      .order("scheduled_at", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, [user]);

  async function cancel(id: string) {
    setBusy(true);
    const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    setBusy(false);
    if (error) toast.error(error.message);
    else { toast.success("Consulta cancelada"); load(); }
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold">As minhas consultas</h1>
            <p className="text-muted-foreground">Histórico e próximas marcações.</p>
          </div>
          <Button className="bg-gradient-hero" asChild><Link to="/book">Agendar nova</Link></Button>
        </div>

        {items.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-soft">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Ainda não tem consultas agendadas.</p>
            <Button asChild><Link to="/book">Agendar primeira consulta</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((a) => {
              const dt = new Date(a.scheduled_at);
              const isPast = dt < new Date();
              const st = STATUS[a.status];
              return (
                <div key={a.id} className="bg-card border border-border rounded-2xl p-5 shadow-soft flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={st.cls}>{st.label}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" />{a.specialties?.name}</span>
                    </div>
                    <h3 className="font-semibold">{a.doctors?.full_name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{dt.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{dt.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    {a.reason && <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{a.reason}</p>}
                  </div>
                  {!isPast && a.status !== "cancelled" && a.status !== "completed" && (
                    <Button variant="outline" size="sm" disabled={busy} onClick={() => cancel(a.id)}>
                      <X className="h-4 w-4 mr-1" />Cancelar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
