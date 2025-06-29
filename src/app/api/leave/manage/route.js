import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  const leaves = await prisma.leave.findMany({
    include: { user: true },
    orderBy: { startDate: 'desc' }
  })
  return NextResponse.json(leaves)
}

export async function PATCH(req) {
  const user = verifyToken(req.headers)
  if (!user || user.role !== 'HR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { id, status } = body

  const updated = await prisma.leave.update({
    where: { id: parseInt(id) },
    data: { status },
  })

  return NextResponse.json(updated)
}
