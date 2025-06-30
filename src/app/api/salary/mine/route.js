import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req) {
  const user = verifyToken(req.headers)

  // if (!user || user.role !== 'EMPLOYEE') {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  // }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period')

  if (period) {
    // kalau ada ?period
    const salary = await prisma.salary.findFirst({
      where: {
        userId: user.id,
        period
      }
    })

    if (!salary) {
      return NextResponse.json(
        { message: 'Salary not found for this period' },
        { status: 404 }
      )
    }

    return NextResponse.json(salary)
  } else {
    // kalau gak ada ?period
    const salaries = await prisma.salary.findMany({
      where: { userId: user.id },
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
}
