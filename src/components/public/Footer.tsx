import { PawPrint, Phone, Mail, MapPin, ExternalLink } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5491100000000";

export function Footer() {
  return (
    <footer className="bg-primary-700 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Marca */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-base block leading-none">
                  Huella & Vínculo
                </span>
                <span className="text-xs text-white/70 leading-none">
                  Educación canina
                </span>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Entendemos a tu perro, te enseñamos a entenderlo.
              Educación canina profesional con seguimiento personalizado.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Especialidades</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Reactividad canina</li>
              <li>Educación básica</li>
              <li>Educación de cachorros</li>
              <li>Convivencia familiar</li>
              <li>Modificación de conductas</li>
              <li>Adiestramiento personalizado</li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Contacto</h3>
            <div className="space-y-3 text-sm text-white/80">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>WhatsApp</span>
              </a>
              <a
                href="mailto:contacto@huellavinculo.com"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>contacto@huellavinculo.com</span>
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Buenos Aires, Argentina</span>
              </div>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>@huellavinculo</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/60">
          <p>© 2025 Huella & Vínculo — Paula Soledad</p>
          <p>Educadora canina profesional</p>
        </div>
      </div>
    </footer>
  );
}
