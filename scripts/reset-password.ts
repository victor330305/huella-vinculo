import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const EMAIL = "victorgonzalez305@hotmail.com";
const NEW_PASSWORD = "Portal2025!";

async function main() {
  const hashed = await bcrypt.hash(NEW_PASSWORD, 12);
  const user = await prisma.user.update({
    where: { email: EMAIL },
    data: { hashedPassword: hashed },
  });
  console.log(`✅ Contraseña reseteada para: ${user.email}`);
  console.log(`   Nueva contraseña: ${NEW_PASSWORD}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error(e); prisma.$disconnect(); });
