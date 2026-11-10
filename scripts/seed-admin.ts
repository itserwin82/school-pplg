import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@smkpplg.sch.id' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@smkpplg.sch.id',
      name: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin berhasil dibuat dengan password: admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());