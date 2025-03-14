"use server"

import { cookies } from "next/headers"
import { headers } from "next/headers"
import prisma from "./prisma"

// Type definitions
type CouponClaimResult = {
  success: boolean
  coupon?: string
  cooldown?: number
  message?: string
}

// Constants
const COOLDOWN_PERIOD = 60 * 60 // 1 hour in seconds
const COOKIE_NAME = "coupon_claim_id"

export async function claimCoupon(): Promise<CouponClaimResult> {
  try {
    // Get client IP address
    const headersList = await headers()
    const forwardedFor = headersList.get("x-forwarded-for")
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown"

    // Check if user has a claim ID cookie
    const cookieStore = await cookies()
    let sessionId = cookieStore.get(COOKIE_NAME)?.value

    if (!sessionId) {
      // Generate a unique ID for this browser session
      sessionId = crypto.randomUUID()
      cookieStore.set(COOKIE_NAME, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      })
    }

    // Check for recent claims from this IP or session ID
    const now = new Date()
    const cooldownTime = new Date(now.getTime() - COOLDOWN_PERIOD * 1000)

    const recentClaims = await prisma.claim.findFirst({
      where: {
        OR: [
          { ip, createdAt: { gte: cooldownTime } },
          { sessionId, createdAt: { gte: cooldownTime } },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // If there's a recent claim, calculate cooldown
    if (recentClaims) {
      const elapsedSeconds = Math.floor((now.getTime() - recentClaims.createdAt.getTime()) / 1000)
      const remainingTime = COOLDOWN_PERIOD - elapsedSeconds

      if (remainingTime > 0) {
        return {
          success: false,
          cooldown: remainingTime,
          message: `Please wait ${Math.ceil(remainingTime / 60)} minutes before claiming another coupon.`,
        }
      }
    }

    // Get the next available coupon using round-robin
    const nextCoupon = await prisma.coupon.findFirst({
      where: { isActive: true },
      orderBy: { position: "asc" },
    })

    if (!nextCoupon) {
      return {
        success: false,
        message: "No coupons available at this time. Please try again later.",
      }
    }

    // Start a transaction to ensure data consistency
    return await prisma.$transaction(async (tx) => {
      // Get the highest position to move this coupon to the end
      const maxPositionResult = await tx.coupon.aggregate({
        _max: { position: true },
      })

      const maxPosition = maxPositionResult._max.position || 0

      // Update the coupon's position (move to end of round-robin)
      await tx.coupon.update({
        where: { id: nextCoupon.id },
        data: { position: maxPosition + 1 },
      })

      // Record this claim
      await tx.claim.create({
        data: {
          ip,
          sessionId,
          couponId: nextCoupon.id,
        },
      })

      return {
        success: true,
        coupon: nextCoupon.code,
      }
    })
  } catch (error) {
    console.error("Error claiming coupon:", error)
    return {
      success: false,
      message: "An error occurred while processing your request.",
    }
  }
}

// Admin function to add coupons
export async function seedCoupons(coupons: string[]): Promise<boolean> {
  try {
    if (coupons.length === 0) return false

    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // Get the highest position
      const maxPositionResult = await tx.coupon.aggregate({
        _max: { position: true },
      })

      let nextPosition = (maxPositionResult._max.position || 0) + 1

      // Create all coupons with sequential positions
      for (const code of coupons) {
        await tx.coupon.create({
          data: {
            code,
            position: nextPosition++,
            isActive: true,
          },
        })
      }
    })

    return true
  } catch (error) {
    console.error("Error seeding coupons:", error)
    return false
  }
}

