import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req) {
  const user = verifyToken(req.headers)
  if (!user || user.role !== 'HR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { userId, amount, period, note } = body

  const salary = await prisma.salary.create({
    data: {
      userId,
      amount,
      period,
      note,
    },
  })

  return NextResponse.json(salary)
}
