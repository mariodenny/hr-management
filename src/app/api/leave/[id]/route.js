import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req) {
  const user = verifyToken(req.headers)

  if (!user || user.role !== 'EMPLOYEE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const leaves = await prisma.leave.findMany({
    where: { userId: user.id },
    include: {
      user: {
        select: { name: true, position: true }
      }
    },
    orderBy: { startDate: 'desc' }
  })

  return NextResponse.json(leaves)
}
