import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function PUT(req) {
  const user = verifyToken(req.headers);
  // if (!user || user.role !== 'EMPLOYEE') {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // }

  const body = await req.json();
  const { oldPassword, newPassword } = body;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  const valid = await bcrypt.compare(oldPassword, dbUser.password);
  if (!valid) {
    return NextResponse.json({ error: 'Old password incorrect' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ message: 'Password updated' });
}
