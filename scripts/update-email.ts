import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const updated = await prisma.user.update({
    where: { email: "paula@huellavinculo.com" },
    data: { email: "normalizacion.330@gmail.com" },
  });
  console.log("✅ Email actualizado:", updated.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
