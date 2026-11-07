import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    text: "Luna ladraba y se abalanzaba sobre cada perro que veíamos en el paseo. Después de trabajar con Paula, podemos caminar tranquilos. La paciencia y el método de Paula cambiaron nuestra relación.",
    ownerName: "María G.",
    dogName: "Luna",
    breed: "Border Collie",
    initials: "MG",
  },
  {
    text: "Adoptamos a Toro sin experiencia con perros grandes. Paula nos enseñó a comunicarnos con él y ahora convive perfectamente con nuestros hijos. No podemos creer el cambio.",
    ownerName: "Familia Rodríguez",
    dogName: "Toro",
    breed: "Labrador",
    initials: "FR",
  },
  {
    text: "Max llegó con muchísima ansiedad de separación. El seguimiento entre sesiones fue clave. Nos mandaba ejercicios y estaba disponible para consultas. Un acompañamiento muy humano.",
    ownerName: "Carlos M.",
    dogName: "Max",
    breed: "Golden Retriever",
    initials: "CM",
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5 mb-4" aria-label="5 de 5 estrellas">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-4 h-4 fill-accent-400 text-accent-400"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-accent-500 uppercase tracking-wider mb-2">
            Testimonios
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-800 mb-4">
            Lo que dicen las familias
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Cada historia es diferente, pero todas comparten algo: un vínculo más fuerte
            con su perro.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.ownerName}
              className="border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-6">
                {/* Comillas decorativas */}
                <div
                  className="text-5xl text-primary-200 font-serif leading-none mb-2 select-none"
                  aria-hidden="true"
                >
                  &ldquo;
                </div>

                {/* Estrellas */}
                <StarRating />

                {/* Texto */}
                <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">
                  {testimonial.text}
                </p>

                {/* Autor */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-sm font-semibold">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-primary-800">
                      {testimonial.ownerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      con {testimonial.dogName} ({testimonial.breed})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
