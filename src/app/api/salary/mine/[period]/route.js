import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req) {
  const user = verifyToken(req.headers)

//   if (!user || user.role !== 'EMPLOYEE') {
//     return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
//   }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period')

  const whereClause = {
    userId: user.id
  }

  if (period) {
    whereClause.period = period
  }

  const salaries = await prisma.salary.findMany({
    where: whereClause,
    orderBy: { period: 'desc' }
  })

  if (!salaries || salaries.length === 0) {
    return NextResponse.json({
      message: 'No salary records found',
      salaries: []
    })
  }

  return NextResponse.json(salaries)
}
