import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administração — SISCON" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [appts, setAppts] = useState<any[]>([]);
  const [stats, setStats] = useState({ today: 0, total: 0, pending: 0, patients: 0 });
  const isAdmin = roles.includes("admin");

  useEffect(() => {
    if (!loading) {
      if (!user) navigate({ to: "/login" });
      else if (!isAdmin) navigate({ to: "/dashboard" });
    }
  }, [user, loading, isAdmin, navigate]);

  async function load() {
    const { data } = await supabase
      .from("appointments")
      .select("id, scheduled_at, status, doctors(full_name), specialties(name)")
      .order("scheduled_at", { ascending: false })
      .limit(100);
    setAppts(data ?? []);
    const all = data ?? [];
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    setStats({
      today: all.filter(a => { const d = new Date(a.scheduled_at); return d >= today && d < tomorrow; }).length,
      total: all.length,
      pending: all.filter(a => a.status === "pending").length,
      patients: new Set(all.map((a: any) => a.patient_id)).size,
    });
  }
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  async function updateStatus(id: string, status: "pending" | "confirmed" | "cancelled" | "completed") {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Estado atualizado"); load(); }
  }

  if (loading || !user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl font-bold mb-1">Painel Administrativo</h1>
        <p className="text-muted-foreground mb-8">Gestão de consultas, médicos e pacientes.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Stat label="Consultas hoje" value={stats.today} />
          <Stat label="Pendentes" value={stats.pending} />
          <Stat label="Total recente" value={stats.total} />
          <Stat label="Pacientes" value={stats.patients} />
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="font-display text-lg font-semibold">Consultas recentes</h2>
          </div>
          <div className="divide-y divide-border">
            {appts.length === 0 && <div className="p-8 text-center text-muted-foreground">Sem consultas registadas.</div>}
            {appts.map((a) => {
              const dt = new Date(a.scheduled_at);
              return (
                <div key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{a.doctors?.full_name}</span>
                      <Badge variant="outline">{a.specialties?.name}</Badge>
                      <Badge>{a.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{dt.toLocaleString("pt-PT")}</div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {a.status === "pending" && <Button size="sm" onClick={() => updateStatus(a.id, "confirmed")}>Confirmar</Button>}
                    {a.status !== "cancelled" && a.status !== "completed" && <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "cancelled")}>Cancelar</Button>}
                    {a.status === "confirmed" && <Button size="sm" variant="secondary" onClick={() => updateStatus(a.id, "completed")}>Concluir</Button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-soft">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-3xl font-bold font-display">{value}</div>
    </div>
  );
}
