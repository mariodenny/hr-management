import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req) {
  const user = verifyToken(req.headers)
  if (!user || user.role !== 'EMPLOYEE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { startDate, endDate, reason } = body

  const leave = await prisma.leave.create({
    data: {
      userId: user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'PENDING',
    },
  })

  return NextResponse.json(leave)
}
