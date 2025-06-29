import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const hrUser = await prisma.user.create({
    data: {
      name: 'Admin HR',
      email: 'admin@example.com',
      position: 'HR Manager',
      division: 'HR',
      username: 'adminhr',
      password: hashedPassword,
      role: 'HR',
    },
  });

  console.log('✅ HR user created:', hrUser);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
