import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(req) {
  const user = verifyToken(req.headers)

  const attendances = await prisma.attendance.findMany({
    include: { user: true },
    orderBy: { date: 'desc' },
    where: { userId: user.id }
  })

  return NextResponse.json(attendances)
}

export async function POST(req) {
  const user = verifyToken(req.headers)

  const body = await req.json()
  const { location } = body

  const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)

  const today = new Date(now)
  today.setUTCHours(0, 0, 0, 0)

  const workStart = new Date(today)
  workStart.setUTCHours(1, 0, 0, 0)

  const status = now > workStart ? 'LATE' : 'PRESENT'

  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      userId: user.id,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }
  })

  if (!existingAttendance) {
    const attendance = await prisma.attendance.create({
      data: {
        userId: user.id,
        date: now,
        checkIn: now,
        checkOut: null,
        location,
        status
      }
    })

    return NextResponse.json({
      message: 'Check-in recorded',
      attendance
    })
  } else {
    if (existingAttendance.checkOut) {
      return NextResponse.json({
        error: 'Already checked out'
      }, { status: 400 })
    }

    const checkInTime = new Date(existingAttendance.checkIn)
    const diffMs = now - checkInTime
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours < 1) {
      return NextResponse.json({
        error: 'Minimum 1 hour between check-in and check-out'
      }, { status: 400 })
    }

    const updated = await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: {
        checkOut: now
      }
    })

    return NextResponse.json({
      message: 'Check-out recorded',
      attendance: updated
    })
  }
}
