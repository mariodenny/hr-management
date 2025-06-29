import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req) {
  const user = verifyToken(req.headers)
  if (!user || user.role !== 'EMPLOYEE') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const salaries = await prisma.salary.findMany({
    where: { userId: user.id },
    orderBy: { period: 'desc' }
  })

  return NextResponse.json(salaries)
}
