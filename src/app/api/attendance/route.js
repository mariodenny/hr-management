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
  const { location, status } = body

  const now = new Date()

  const attendance = await prisma.attendance.create({
    data: {
      userId: user.id,
      date: now,
      time: now,
      location,
      status
    },
  })

  return NextResponse.json(attendance)
}
