import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // Crear usuario administrador (Paula)
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "HuellaVinculo2025!",
    12
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || "paula@huellavinculo.com" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "paula@huellavinculo.com",
      hashedPassword,
      name: "Paula Soledad",
      role: "ADMIN",
    },
  });

  console.log(`✅ Usuario admin creado: ${admin.email}`);

  // Crear datos de ejemplo
  const owner = await prisma.owner.upsert({
    where: { email: "ejemplo@email.com" },
    update: {},
    create: {
      firstName: "María",
      lastName: "González",
      email: "ejemplo@email.com",
      phone: "+54 911 2345-6789",
      address: "Buenos Aires",
      notes: "Cliente de ejemplo para demostración",
    },
  });

  console.log(`✅ Propietario de ejemplo: ${owner.firstName} ${owner.lastName}`);

  const dog = await prisma.dog.upsert({
    where: { id: "ejemplo-perro-001" },
    update: {},
    create: {
      id: "ejemplo-perro-001",
      ownerId: owner.id,
      name: "Coco",
      breed: "Labrador Retriever",
      approximateAge: "3 años",
      sex: "MALE",
      color: "Amarillo",
      notes: "Perro de ejemplo para demostración",
    },
  });

  console.log(`✅ Perro de ejemplo: ${dog.name}`);

  await prisma.dogProfile.upsert({
    where: { dogId: dog.id },
    update: {},
    create: {
      dogId: dog.id,
      initialEvaluation:
        "Coco es un perro activo y social. Presenta reactividad leve a otros perros en la correa.",
      background: "Vive con su propietaria desde cachorro. No tiene antecedentes de agresividad.",
      identifiedNeeds: "Trabajo de reactividad en correa, refuerzo de llamada.",
      agreedObjectives:
        "Reducir la reactividad a otros perros en un 70% en 2 meses de trabajo.",
      workPlan:
        "Sesiones semanales + ejercicios diarios de desensibilización y contracondicionamiento.",
      homeRecommendations:
        "Usar arnés de doble punto. Paseos en horarios tranquilos inicialmente.",
    },
  });

  console.log("✅ Expediente de ejemplo creado");
  console.log("\n🎉 Seed completado!");
  console.log(`\n📋 Acceso al panel admin:`);
  console.log(`   Email:      ${process.env.ADMIN_EMAIL || "paula@huellavinculo.com"}`);
  console.log(`   Contraseña: ${process.env.ADMIN_PASSWORD || "HuellaVinculo2025!"}`);
  console.log(`   URL:        http://localhost:3000/login`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
