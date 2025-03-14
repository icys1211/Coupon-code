"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Gift, Clock } from "lucide-react"
import { claimCoupon } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function CouponClaim() {
  const [isLoading, setIsLoading] = useState(false)
  const [coupon, setCoupon] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState<number | null>(null)
  const { toast } = useToast()

  const handleClaimCoupon = async () => {
    setIsLoading(true)
    try {
      const result = await claimCoupon()

      if (result.success) {
        setCoupon(result.coupon)
        toast({
          title: "Coupon claimed!",
          description: `Your coupon code is: ${result.coupon}`,
        })
      } else if (result.cooldown) {
        setCooldown(result.cooldown)
        toast({
          title: "Please wait",
          description: `You can claim another coupon in ${formatTime(result.cooldown)}`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to claim coupon",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-center">Claim Your Coupon</CardTitle>
        <CardDescription className="text-center">Get an exclusive discount on your next purchase</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {coupon ? (
          <div className="text-center">
            <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-600 mb-1">Your coupon code</p>
              <p className="text-xl font-mono font-bold tracking-wider">{coupon}</p>
            </div>
            <p className="text-sm text-gray-500">Copy this code and use it at checkout</p>
          </div>
        ) : cooldown ? (
          <div className="text-center p-4">
            <Clock className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <p className="text-amber-600 font-medium">Cooldown Period</p>
            <p className="text-sm text-gray-600 mt-2">You can claim another coupon in {formatTime(cooldown)}</p>
          </div>
        ) : (
          <div className="text-center p-4">
            <Gift className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <p className="text-gray-600 text-sm mt-2">Click the button below to claim your coupon</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className={cn("w-full", coupon && "bg-green-600 hover:bg-green-700")}
          onClick={handleClaimCoupon}
          disabled={isLoading || !!cooldown}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : coupon ? (
            "Claim Another Coupon"
          ) : cooldown ? (
            `Wait ${formatTime(cooldown)}`
          ) : (
            "Claim Coupon"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

