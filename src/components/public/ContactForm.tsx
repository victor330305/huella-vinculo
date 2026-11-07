"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const contactSchema = z.object({
  ownerName: z.string().min(2, "Ingresá tu nombre completo"),
  phone: z.string().min(6, "Ingresá un teléfono válido"),
  email: z.string().email("Ingresá un email válido"),
  dogName: z.string().min(1, "Ingresá el nombre de tu perro"),
  breed: z.string().optional(),
  approximateAge: z.string().optional(),
  specialty: z.enum([
    "reactividad",
    "educacion-basica",
    "cachorros",
    "convivencia",
    "modificacion-conductas",
    "adiestramiento",
    "otro",
  ]),
  message: z.string().max(500, "Máximo 500 caracteres").optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const specialtyOptions = [
  { value: "reactividad", label: "Reactividad canina" },
  { value: "educacion-basica", label: "Educación básica" },
  { value: "cachorros", label: "Educación de cachorros" },
  { value: "convivencia", label: "Convivencia familiar" },
  { value: "modificacion-conductas", label: "Modificación de conductas" },
  { value: "adiestramiento", label: "Adiestramiento personalizado" },
  { value: "otro", label: "Otro / No sé" },
] as const;

type SubmitStatus = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      ownerName: "",
      phone: "",
      email: "",
      dogName: "",
      breed: "",
      approximateAge: "",
      specialty: undefined,
      message: "",
    },
  });

  const selectedSpecialty = watch("specialty");

  const onSubmit = async (data: ContactFormValues) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contacto" className="py-20 bg-primary-700">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-accent-300 uppercase tracking-wider mb-2">
            Contacto
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Empezá hoy
          </h2>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            Contame sobre tu perro y te respondo a la brevedad para coordinar
            la evaluación inicial gratuita.
          </p>
        </div>

        {/* Success state */}
        {status === "success" && (
          <div className="flex items-start gap-4 bg-primary-600/60 border border-primary-400 rounded-xl p-6 mb-8">
            <CheckCircle2 className="w-6 h-6 text-accent-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">¡Mensaje enviado!</p>
              <p className="text-white/80 text-sm">
                Recibí tu consulta. Me voy a comunicar con vos en las próximas horas.
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="flex items-start gap-4 bg-red-900/40 border border-red-500/40 rounded-xl p-6 mb-8">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold mb-1">Algo salió mal</p>
              <p className="text-white/80 text-sm">
                No se pudo enviar tu consulta. Podés intentarlo de nuevo o escribirme
                directamente por WhatsApp.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="bg-primary-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-primary-600/40 space-y-6"
        >
          {/* Fila 1: Nombre y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="ownerName" className="text-white/90">
                Tu nombre *
              </Label>
              <Input
                id="ownerName"
                placeholder="María García"
                error={errors.ownerName?.message}
                {...register("ownerName")}
                className="bg-primary-900/60 border-primary-500/50 text-white placeholder:text-white/40 focus:ring-accent-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-white/90">
                Teléfono / WhatsApp *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+54 9 11 1234 5678"
                error={errors.phone?.message}
                {...register("phone")}
                className="bg-primary-900/60 border-primary-500/50 text-white placeholder:text-white/40 focus:ring-accent-400"
              />
            </div>
          </div>

          {/* Fila 2: Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white/90">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              {...register("email")}
              className="bg-primary-900/60 border-primary-500/50 text-white placeholder:text-white/40 focus:ring-accent-400"
            />
          </div>

          {/* Fila 3: Nombre del perro y raza */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="dogName" className="text-white/90">
                Nombre de tu perro *
              </Label>
              <Input
                id="dogName"
                placeholder="Luna"
                error={errors.dogName?.message}
                {...register("dogName")}
                className="bg-primary-900/60 border-primary-500/50 text-white placeholder:text-white/40 focus:ring-accent-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="breed" className="text-white/90">
                Raza <span className="text-white/50">(opcional)</span>
              </Label>
              <Input
                id="breed"
                placeholder="Border Collie, mestizo..."
                {...register("breed")}
                className="bg-primary-900/60 border-primary-500/50 text-white placeholder:text-white/40 focus:ring-accent-400"
              />
            </div>
          </div>

          {/* Fila 4: Edad y especialidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="approximateAge" className="text-white/90">
                Edad aproximada <span className="text-white/50">(opcional)</span>
              </Label>
              <Input
                id="approximateAge"
                placeholder="2 años, 8 meses..."
                {...register("approximateAge")}
                className="bg-primary-900/60 border-primary-500/50 text-white placeholder:text-white/40 focus:ring-accent-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="specialty" className="text-white/90">
                ¿En qué área necesitás ayuda? *
              </Label>
              <Select
                value={selectedSpecialty}
                onValueChange={(val) =>
                  setValue("specialty", val as ContactFormValues["specialty"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  id="specialty"
                  error={errors.specialty?.message}
                  className="bg-primary-900/60 border-primary-500/50 text-white data-[placeholder]:text-white/40 focus:ring-accent-400"
                >
                  <SelectValue placeholder="Seleccioná una opción" />
                </SelectTrigger>
                <SelectContent>
                  {specialtyOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mensaje */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-white/90">
              Contame más sobre tu situación{" "}
              <span className="text-white/50">(opcional)</span>
            </Label>
            <Textarea
              id="message"
              placeholder="Describí brevemente qué conducta te preocupa, cuánto tiempo lleva, qué intentaste hasta ahora..."
              rows={4}
              error={errors.message?.message}
              {...register("message")}
              className="bg-primary-900/60 border-primary-500/50 text-white placeholder:text-white/40 focus:ring-accent-400 resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={status === "loading"}
            className="w-full bg-accent-400 hover:bg-accent-500 text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-60"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Solicitar evaluación gratuita"
            )}
          </Button>

          <p className="text-center text-white/50 text-xs">
            * Campos requeridos. Tu información está segura y no se comparte con terceros.
          </p>
        </form>
      </div>
    </section>
  );
}
