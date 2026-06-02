import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/doctor")({
  head: () => ({ meta: [{ title: "Agenda do médico — SISCON" }] }),
  component: DoctorPage,
});

function DoctorPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const [appts, setAppts] = useState<any[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const isDoctor = roles.includes("doctor");

  useEffect(() => {
    if (!loading) {
      if (!user) navigate({ to: "/login" });
      else if (!isDoctor && !roles.includes("admin")) navigate({ to: "/dashboard" });
    }
  }, [user, loading, isDoctor, roles, navigate]);

  async function load() {
    if (!user) return;
    const { data: doc } = await supabase.from("doctors").select("id").eq("user_id", user.id).maybeSingle();
    if (!doc) { setAppts([]); return; }
    const { data } = await supabase
      .from("appointments")
      .select("id, scheduled_at, status, reason, notes, specialties(name)")
      .eq("doctor_id", doc.id)
      .order("scheduled_at");
    setAppts(data ?? []);
  }
  useEffect(() => { load(); }, [user]);

  async function update(id: string, patch: any) {
    const { error } = await supabase.from("appointments").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Atualizado"); load(); }
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-1">A minha agenda</h1>
        <p className="text-muted-foreground mb-8">Consultas atribuídas e observações clínicas.</p>

        {appts.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground shadow-soft">
            Ainda não tem consultas atribuídas.
          </div>
        ) : (
          <div className="space-y-3">
            {appts.map((a) => {
              const dt = new Date(a.scheduled_at);
              return (
                <div key={a.id} className="bg-card border border-border rounded-2xl p-5 shadow-soft">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div>
                      <Badge variant="outline" className="mr-2">{a.specialties?.name}</Badge>
                      <Badge>{a.status}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{dt.toLocaleString("pt-PT")}</span>
                  </div>
                  {a.reason && <p className="text-sm text-muted-foreground mb-3"><b>Motivo:</b> {a.reason}</p>}
                  <Textarea
                    placeholder="Observações clínicas..."
                    defaultValue={a.notes || ""}
                    onChange={(e) => setNotes({ ...notes, [a.id]: e.target.value })}
                    rows={2}
                    className="mb-3"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" onClick={() => update(a.id, { notes: notes[a.id] ?? a.notes })}>Guardar notas</Button>
                    {a.status === "pending" && <Button size="sm" variant="secondary" onClick={() => update(a.id, { status: "confirmed" })}>Confirmar</Button>}
                    {a.status === "confirmed" && <Button size="sm" variant="secondary" onClick={() => update(a.id, { status: "completed", notes: notes[a.id] ?? a.notes })}>Concluir</Button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
