import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req, { params }) {
  const user = verifyToken(req.headers)

  if (!user || user.role !== 'HR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = params

  const leave = await prisma.leave.findUnique({
    where: { id: parseInt(id) },
  })

  if (!leave) {
    return NextResponse.json({ error: 'Leave not found' }, { status: 404 })
  }

  return NextResponse.json(leave)
}
