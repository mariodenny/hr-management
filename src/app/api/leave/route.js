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

export async function GET(req) {
  const user = verifyToken(req.headers)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let leaves = []

  if (user.role === 'HR') {
    leaves = await prisma.leave.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        user: {
          select: { name: true, position: true }
        }
      }
    })
  } else if (user.role === 'EMPLOYEE') {
    leaves = await prisma.leave.findMany({
      where: { userId: user.id },
      orderBy: { startDate: 'desc' }
    })
  } else {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(leaves)
}
