import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { position: "asc" },
      select: {
        id: true,
        code: true,
        isActive: true,
        position: true,
        createdAt: true,
        _count: {
          select: { claims: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      coupons: coupons.map((c) => ({
        ...c,
        claimCount: c._count.claims,
      })),
    })
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
