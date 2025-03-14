import { type NextRequest, NextResponse } from "next/server"
import { seedCoupons } from "@/lib/actions"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { coupons } = body

    if (!Array.isArray(coupons) || coupons.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid coupons array" }, { status: 400 })
    }

    const result = await seedCoupons(coupons)

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Successfully added ${coupons.length} coupons`,
      })
    } else {
      return NextResponse.json({ success: false, message: "Failed to add coupons" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in seed-coupons API:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

