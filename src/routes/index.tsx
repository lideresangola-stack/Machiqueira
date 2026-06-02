import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, ShieldCheck, Clock, Users, Stethoscope, Baby, HeartPulse, Heart, Bone, ShieldCheck as Shield } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-hospital.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SISCON-MAXIQUEIRA — Consultas médicas online" },
      { name: "description", content: "Agende consultas no Hospital Municipal da Maxiqueira em minutos. Especialidades, médicos e horários disponíveis online." },
    ],
  }),
  component: Index,
});

const specialties = [
  { name: "Clínica Geral", icon: Stethoscope, desc: "Cuidados primários e diagnóstico." },
  { name: "Pediatria", icon: Baby, desc: "Saúde das crianças e adolescentes." },
  { name: "Ginecologia", icon: HeartPulse, desc: "Saúde da mulher e reprodutiva." },
  { name: "Cardiologia", icon: Heart, desc: "Diagnóstico e tratamento do coração." },
  { name: "Ortopedia", icon: Bone, desc: "Ossos, articulações e músculos." },
  { name: "Dermatologia", icon: Shield, desc: "Pele, cabelo e unhas." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-soft" />
        <div className="container mx-auto px-4 pt-16 pb-24 lg:pt-24 lg:pb-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Hospital Municipal da Maxiqueira · Angola
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                A sua saúde, <span className="text-gradient">agendada</span> em segundos.
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                SISCON-MAXIQUEIRA é o sistema oficial de marcação de consultas do hospital. Escolha a especialidade, o médico e o horário — tudo num só lugar.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button size="lg" className="bg-gradient-hero shadow-elevated h-12 px-6 text-base" asChild>
                  <Link to="/signup">Agendar consulta</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6 text-base" asChild>
                  <Link to="/login">Já tenho conta</Link>
                </Button>
              </div>
              <div className="flex gap-8 pt-6 text-sm">
                <div><div className="text-2xl font-bold text-foreground">6+</div><div className="text-muted-foreground">Especialidades</div></div>
                <div><div className="text-2xl font-bold text-foreground">24/7</div><div className="text-muted-foreground">Marcação online</div></div>
                <div><div className="text-2xl font-bold text-foreground">100%</div><div className="text-muted-foreground">Seguro</div></div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-hero opacity-20 blur-3xl rounded-3xl" />
              <img src={heroImg} alt="Recepção do Hospital Municipal da Maxiqueira" width={1920} height={1080} className="relative rounded-3xl shadow-elevated w-full h-auto object-cover aspect-[16/10]" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Calendar, title: "Marcação instantânea", desc: "Escolha o seu horário disponível com calendário interativo." },
            { icon: ShieldCheck, title: "Dados protegidos", desc: "Encriptação ponta-a-ponta e autenticação segura." },
            { icon: Clock, title: "Notificações e lembretes", desc: "Receba confirmações e lembretes automáticos." },
          ].map((f) => (
            <div key={f.title} className="bg-gradient-card border border-border rounded-2xl p-6 shadow-soft hover:shadow-elevated transition">
              <div className="h-12 w-12 rounded-xl bg-gradient-hero flex items-center justify-center mb-4 shadow-glow">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specialties */}
      <section className="container mx-auto px-4 py-12 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Especialidades disponíveis</h2>
          <p className="text-muted-foreground">Equipa médica qualificada pronta para o atender.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialties.map((s) => (
            <div key={s.name} className="group bg-card border border-border rounded-2xl p-5 flex items-start gap-4 hover:border-primary/40 hover:shadow-soft transition">
              <div className="h-11 w-11 shrink-0 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center group-hover:bg-gradient-hero group-hover:text-primary-foreground transition">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-0.5">{s.name}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-16 text-center shadow-elevated">
          <Users className="absolute -right-8 -top-8 h-48 w-48 text-primary-foreground/10" />
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-3">Pronto para cuidar da sua saúde?</h2>
          <p className="text-primary-foreground/90 max-w-xl mx-auto mb-6">Crie a sua conta gratuita e marque a primeira consulta em menos de 2 minutos.</p>
          <Button size="lg" variant="secondary" className="h-12 px-8 text-base" asChild>
            <Link to="/signup">Começar agora</Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SISCON-MAXIQUEIRA · Hospital Municipal da Maxiqueira
      </footer>
    </div>
  );
}
