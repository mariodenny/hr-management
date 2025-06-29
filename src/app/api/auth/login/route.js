import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET

export async function POST(req) {
  const body = await req.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing username or password.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
  }

  if (user.role !== 'HR') {
    return NextResponse.json({ error: 'Access denied. Not HR.' }, { status: 403 });
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return NextResponse.json({ token });
}
