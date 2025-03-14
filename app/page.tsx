import CouponClaim from "@/components/coupon-claim"
import NavBar from "@/components/nav-bar"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Offer Coupons</h1>
            <p className="text-gray-600">Claim your exclusive discount coupon below. One coupon per user.</p>
          </div>

          <CouponClaim />
        </div>
      </main>
      <Toaster />
    </div>
  )
}

