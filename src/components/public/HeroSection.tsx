import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5491100000000";

const highlights = [
  "Evaluación inicial gratuita",
  "Seguimiento personalizado",
  "Expediente digital de tu perro",
];

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 overflow-hidden">
      {/* Patrón decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent-400 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-accent-300 rounded-full"></span>
            Educación canina profesional
          </div>

          {/* Título principal */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
            Entendemos a tu perro,{" "}
            <span className="text-accent-300">te enseñamos</span>{" "}
            a entenderlo
          </h1>

          {/* Subtítulo */}
          <p className="text-lg sm:text-xl text-white/85 mb-8 leading-relaxed max-w-2xl">
            Un enfoque basado en el vínculo, el respeto y el conocimiento.
            Cada perro recibe un plan personalizado y seguimiento real entre sesiones.
          </p>

          {/* Highlights */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/90 text-sm">
                <CheckCircle2 className="w-4 h-4 text-accent-300 shrink-0" />
                {item}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#contacto">
              <Button
                size="lg"
                className="bg-accent-400 hover:bg-accent-500 text-white font-semibold shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Solicitar evaluación gratuita
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/60 text-white hover:bg-white/10 hover:border-white w-full sm:w-auto backdrop-blur-sm"
              >
                Consultar por WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Ola decorativa inferior */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 60L1440 60L1440 30C1200 60 960 0 720 30C480 60 240 0 0 30L0 60Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
