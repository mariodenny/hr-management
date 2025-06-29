import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req) {
  const user = verifyToken(req.headers)
  if (!user || user.role !== 'HR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const attendances = await prisma.attendance.findMany({
    include: { user: true },
    orderBy: { date: 'desc' }
  })

  return NextResponse.json(attendances)
}
