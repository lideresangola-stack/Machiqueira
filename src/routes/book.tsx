import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/book")({
  head: () => ({ meta: [{ title: "Agendar consulta — SISCON" }] }),
  component: BookPage,
});

const HOURS = ["08:00","09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00"];

function BookPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialtyId, setSpecialtyId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  useEffect(() => {
    supabase.from("specialties").select("*").order("name").then(({ data }) => setSpecialties(data ?? []));
  }, []);

  useEffect(() => {
    if (!specialtyId) { setDoctors([]); setDoctorId(""); return; }
    supabase.from("doctors").select("*").eq("specialty_id", specialtyId).order("full_name").then(({ data }) => setDoctors(data ?? []));
  }, [specialtyId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!specialtyId || !doctorId || !date || !time) { toast.error("Preencha todos os campos"); return; }
    const scheduled_at = new Date(`${date}T${time}:00`).toISOString();
    if (new Date(scheduled_at) < new Date()) { toast.error("Escolha uma data futura"); return; }
    setSaving(true);
    const { error } = await supabase.from("appointments").insert({
      patient_id: user.id, doctor_id: doctorId, specialty_id: specialtyId,
      scheduled_at, reason: reason.slice(0, 500) || null, status: "pending",
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Consulta solicitada! Aguarde confirmação.");
    navigate({ to: "/appointments" });
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-soft">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-2">Agendar consulta</h1>
        <p className="text-muted-foreground mb-8">Escolha a especialidade, o médico e o horário desejado.</p>

        <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-soft space-y-5">
          <div className="space-y-1.5">
            <Label>Especialidade</Label>
            <Select value={specialtyId} onValueChange={setSpecialtyId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {specialties.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Médico</Label>
            <Select value={doctorId} onValueChange={setDoctorId} disabled={!specialtyId}>
              <SelectTrigger><SelectValue placeholder={specialtyId ? "Selecione um médico" : "Escolha a especialidade primeiro"} /></SelectTrigger>
              <SelectContent>
                {doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Hora</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger><SelectValue placeholder="Hora" /></SelectTrigger>
                <SelectContent>{HOURS.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Motivo da consulta (opcional)</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} placeholder="Descreva brevemente os sintomas ou motivo..." rows={3} />
          </div>

          <Button type="submit" disabled={saving} className="w-full h-11 bg-gradient-hero shadow-soft">
            {saving ? "A enviar..." : "Solicitar consulta"}
          </Button>
        </form>
      </main>
    </div>
  );
}
