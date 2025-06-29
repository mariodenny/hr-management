import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  const user = verifyToken(req.headers);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;

  const employee = await prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      email: true,
      position: true,
      division: true,
      username: true,
      role: true,
    },
  });

  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  // HR bisa lihat siapa saja, EMPLOYEE hanya boleh lihat diri sendiri
  if (user.role === 'EMPLOYEE' && user.id !== employee.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(employee);
}
