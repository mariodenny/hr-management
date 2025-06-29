import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req) {
  const user = verifyToken(req.headers);
  if (!user || user.role !== 'HR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const employees = await prisma.user.findMany({ where: { role: 'EMPLOYEE' } });
  return NextResponse.json(employees);
}

export async function POST(req) {
  const user = verifyToken(req.headers);
  if (!user || user.role !== 'HR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { name, email, position, division, username, password } = body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const employee = await prisma.user.create({
    data: { name, email, position, division, username, password: hashedPassword, role: 'EMPLOYEE' },
  });
  return NextResponse.json(employee);
}

export async function PATCH(req) {
  const user = verifyToken(req.headers);
  if (!user || user.role !== 'HR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { id, name, email, position, division } = body;

  const updated = await prisma.user.update({
    where: { id: parseInt(id) },
    data: { name, email, position, division },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req) {
  const user = verifyToken(req.headers);
  if (!user || user.role !== 'HR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { id } = body;

  await prisma.user.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ message: 'Employee deleted' });
}
